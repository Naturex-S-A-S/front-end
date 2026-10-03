# Generación automática de códigos e ids (producto, empaque, materia prima) y lotes de órdenes de producción

| | |
|---|---|
| **Fecha** | 2026-09-24 |
| **Estado** | `implementada` |
| **Alcance de este repo** | Solo la sección [Cambios sugeridos en el frontend](#cambios-sugeridos-en-el-frontend) (línea 299 en adelante). El resto del documento describe el **repo backend**: migraciones SQL, adapters JDBC, use cases Java. Se conserva acá porque define el contrato que el frontend consume. |
| **Plan de ejecución** | [`plan.md`](./plan.md) |
| **Verificación manual** | [`QA.md`](./QA.md) |

> Nota de ubicación: este documento nació en el repo de backend y se referencia desde el frontend. Se mantiene en `specs/` de este repo como documento vivo; no es una spec de frontend per se.

## Contexto

Hoy los códigos/ids de `FinalProduct`, `Packaging` y `FeedstockItem` no tienen relación con la categoría del ítem:
- `FinalProduct.id`: el cliente lo escribe a mano y es obligatorio. `Packaging.id`/`FeedstockItem.id`: se generan con un timestamp sin sentido.
- `Order.batch` (lote de fabricación): se genera en el controller como `"OP-" + epochSeconds`. `Order.dateExpiration` viene siempre del cliente.
- Las relaciones producto↔categoría, packaging↔categoría y feedstock↔categoría son hoy muchos-a-muchos vía tablas intermedias (`product_categorized`, `packaging_categorized`, `feedstock_categorized`), lo que hace imposible garantizar de forma estructural que un producto tenga "exactamente una" categoría que defina su id.

El objetivo: generar estos códigos automáticamente según reglas configurables por categoría (definidas al crear/editar la categoría desde `CategoryRest.java`), sin aceptar códigos manuales por API, y sin ambigüedad posible sobre qué categoría rige cada generación.

## Decisiones confirmadas (todas las rondas de la conversación)

1. **Packaging con consecutivo compartido** (Envase=E, Tapa=TA, Bolsa Doypack=E, Lainer=L, Foil=F, Cuchara=C): consecutivo de **4 dígitos**, compartido entre todas estas categorías (si el último fue `TA0003`, el siguiente es `E0004`), sin guion.
2. **Sin id manual por API**: los DTOs de creación/actualización de `FinalProduct`, `Packaging` y `FeedstockItem` no exponen ningún campo de id/código — siempre se genera.
3. **Las relaciones de categoría pasan de muchos-a-muchos a FK directa (1 a muchos), eliminando las tablas intermedias**, para las tres entidades: `product → product_categories`, `packaging → packaging_categories`, `feedstock → feedstock_categories`. Los DTOs de entrada/salida **mantienen el formato actual de arreglo** (`List<String>`/`List<CategoryDto>`), pero validados para aceptar/retornar como máximo 1 elemento — el cambio real ocurre en la persistencia (columna FK única en vez de tabla intermedia), no en el contrato de la API existente.
4. **El eje "categoría de lote" se separa en una tabla nueva e independiente: `lot_categories`** (no se mezcla con `product_categories` mediante un discriminador). Un producto tiene una relación 1 a muchos genuina hacia `lot_categories` (`final_product.lot_category_id`, campo nuevo, singular — no arreglo, porque no hay contrato previo que preservar). `product_categories` conserva su único rol: definir el **id** del producto y sus meses de **vencimiento**.
5. **El lote completo se persiste por ítem, no se calcula en lectura.** `Order.batch` guarda solo el consecutivo crudo (sin letra ni sufijo de producto); cada `OrderItem` gana `batchLot` con el lote completo (letra + consecutivo + sufijo del producto), calculado y guardado al crear la orden.
6. **El consecutivo de lote se reinicia cada año**, configurable manualmente desde BD el valor de arranque del primer año (después, incremental con reinicio automático al cambiar de año).
7. **Etiqueta de vencimiento**: formato `V.JUL 02/25` (`V.` + mes 3 letras + espacio + día 2 dígitos + `/` + año 2 dígitos), persistida como columna nueva en `orders`.
8. `date_expiration` se retira del body de creación de orden de producción (se calcula server-side).
9. **No se migran datos existentes de categorías** — el usuario limpiará manualmente las tablas de categorías (y sus relaciones) en su BD local de pruebas antes de aplicar esta migración, así que no se necesita lógica de "elegir cuál categoría se queda" para filas ya existentes.
10. **`orders`/`items` son tablas compartidas entre órdenes de producción y de aprovisionamiento (supply)** — este plan solo modifica el flujo de **producción** (`OrderProductionUseCase`/`OrderProductionRest`, `classification="produccion"`). Las órdenes de aprovisionamiento (`OrderSupplyUseCase`/su REST correspondiente) **no son parte de este requerimiento** y quedan sin tocar: siguen funcionando exactamente como hoy. Las columnas nuevas (`orders.expiration_label`, `items.batch_lot`) son nullable y simplemente quedan sin usar (`null`) en las filas de órdenes de aprovisionamiento — no se les exige ni se les genera lote/vencimiento con esta lógica. Si en el futuro se decide que aprovisionamiento reutilice el mismo mecanismo, es una extensión aparte, no parte de este plan.

### Por qué `lot_categories` como tabla separada (no una columna discriminadora en `product_categories`)

Se evaluaron tres alternativas para evitar que un producto quede con categorías ambiguas (ninguna, o más de una, definiendo su id o su lote):
- **Columna `categoryKind` en `product_categories` + validación por conteo en código**: no requiere tabla nueva, pero la relación producto↔categoría sigue siendo muchos-a-muchos — la garantía de "exactamente una" solo existe en el código, en el momento de generar (no lo impide la base de datos).
- **Tabla de unión `product_category_role(product_id, role, category_id)`**: mismo nivel de garantía que la opción anterior (sigue siendo muchos-a-muchos), pero con más tablas/código nuevo — no aporta nada extra.
- **FK directa 1 a muchos** (la elegida): `final_product.category_id` y `final_product.lot_category_id`, cada una apuntando a una sola fila. La ambigüedad de "más de una" queda estructuralmente resuelta (una columna no puede apuntar a dos filas), sin tabla intermedia ni conteos en código. Como el eje de lote (`Alimentos`/`Cosméticos`) es conceptualmente distinto al eje de presentación (`Polvos`/`Líquidos`/etc.), se modela en su propia tabla (`lot_categories`) en vez de mezclarlo con `product_categories` — así el lado de presentación puede seguir evolucionando (o mantenerse) de forma independiente del lado de lote.

## Diseño

### 1. Migración — `V4__code_generation_and_expiration.sql`
`infrastructure/driven-adapters/jpa-repository/src/main/resources/db/migration/V4__code_generation_and_expiration.sql`

```sql
-- Las relaciones de categoría pasan de muchos-a-muchos a FK directa; se eliminan las tablas intermedias.
-- (El usuario limpia manualmente los datos de categorías existentes antes de aplicar esta migración.)
DROP TABLE IF EXISTS inventory.product_categorized;
DROP TABLE IF EXISTS inventory.packaging_categorized;
DROP TABLE IF EXISTS inventory.feedstock_categorized;

ALTER TABLE inventory.product_categories
    ADD COLUMN id_indicator character varying(2),
    ADD COLUMN expiration_months integer;

ALTER TABLE inventory.packaging_categories
    ADD COLUMN code_indicator character varying(4),
    ADD COLUMN depends_on_product boolean;

CREATE TABLE inventory.lot_categories (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    lot_format character varying(32),
    date_created timestamp NOT NULL,
    date_updated timestamp,
    CONSTRAINT lot_categories_pkey PRIMARY KEY (id),
    CONSTRAINT lot_categories_name_key UNIQUE (name)
);

ALTER TABLE inventory.final_product
    ADD COLUMN category_id character varying(255),
    ADD COLUMN lot_category_id character varying(255),
    ADD CONSTRAINT fk_final_product_category FOREIGN KEY (category_id) REFERENCES inventory.product_categories(id),
    ADD CONSTRAINT fk_final_product_lot_category FOREIGN KEY (lot_category_id) REFERENCES inventory.lot_categories(id);

ALTER TABLE inventory.packaging
    ADD COLUMN category_id character varying(255),
    ADD COLUMN sequential_code integer,
    ADD CONSTRAINT fk_packaging_category FOREIGN KEY (category_id) REFERENCES inventory.packaging_categories(id);

ALTER TABLE inventory.feedstocks
    ADD COLUMN category_id character varying(255),
    ADD CONSTRAINT fk_feedstocks_category FOREIGN KEY (category_id) REFERENCES inventory.feedstock_categories(id);

ALTER TABLE inventory.orders
    ADD COLUMN expiration_label character varying(16);

ALTER TABLE inventory.items
    ADD COLUMN batch_lot character varying(64);

CREATE TABLE inventory.code_sequences (
    scope character varying(64) NOT NULL,
    last_value integer NOT NULL,
    CONSTRAINT code_sequences_pkey PRIMARY KEY (scope)
);
```
**Nota de diseño**: las FK nuevas quedan nullable a nivel de BD a propósito — la garantía real contra la ambigüedad la da la cardinalidad de la columna (nunca puede apuntar a dos filas), no un `NOT NULL`. La obligatoriedad ("todo producto debe tener categoría e id de lote") se exige en los DTOs de creación (`@NotBlank`/`@Size(min=1,max=1)`), evitando que la migración dependa de si `final_product`/`packaging`/`feedstocks` ya tienen filas. Si se prefiere `NOT NULL` real en BD, avisar antes de implementar — requeriría confirmar que esas tablas también están vacías en el entorno de pruebas.

`feedstocks.category_id` es nullable y sin rol en la generación de código (el código de materia prima es un consecutivo global simple, no depende de categoría) — se agrega solo por consistencia arquitectónica, según lo solicitado.

**Verificar durante implementación**: correr un grep por `product_categorized`/`packaging_categorized`/`feedstock_categorized` en todo el repo (consultas nativas, reportes, otros adapters) antes de eliminarlas, por si algo más además del mapeo JPA estándar las referencia directamente.

### 2. Modelos de dominio

**Sin renombrar los campos de categoría existentes** (se mantienen como `List<...>` exactamente como hoy, para no romper el contrato de dominio/DTO — la garantía de "máximo 1" la impone la persistencia + validación de DTO, no un cambio de tipo):
- `FinalProduct.categories: List<ProductCategory>` — tipo sin cambios; en la práctica siempre 0 o 1 elemento.
- `Packaging.category: List<PackagingCategory>` — tipo sin cambios.
- `FeedstockItem.categories: List<FeedstockCategory>` — tipo sin cambios.

**Campos nuevos:**
- `ProductCategory`: `String idIndicator`, `Integer expirationMonths`.
- `PackagingCategory`: `String codeIndicator`, `Boolean dependsOnProduct`.
- `Packaging`: `Integer sequentialCode` (espejo de la columna auxiliar; null en empaques dependientes de producto).
- `FinalProduct`: **`LotCategory lotCategory`** (nuevo, singular — sin arreglo, es un concepto nuevo sin contrato previo).
- `Order`: `String expirationLabel`. `batch` se reinterpreta (mismo campo): ahora contiene **solo** el consecutivo crudo con padding (ej. `"0001"`/`"001"`), sin letra ni sufijo.
- `OrderItem`: `String batchLot` (lote completo, ej. `"L00012001"`, `"C-0011016"`).

**Modelo nuevo — `LotCategory`** (`domain/model/.../lot/LotCategory.java`): `String id, String name, String lotFormat, LocalDateTime dateCreated, LocalDateTime dateUpdated` — mismo shape simple que las demás categorías.

**Nueva excepción** `domain/model/.../exceptions/CodeGenerationConfigurationException.java`, para: `productCode` faltante en empaque con `dependsOnProduct=true`, `lotFormat` no soportado por ninguna estrategia registrada, o ítems de una misma orden con categorías de lote distintas/ausentes. Registrar en `GlobalExceptionHandler` como `HttpStatus.BAD_REQUEST`.

**Helper simple en `FinalProduct.java`** (ya no hace falta lógica de ambigüedad — la cardinalidad ya lo garantiza):
```java
public Optional<ProductCategory> getPresentationCategory() {
    return categories == null || categories.isEmpty() ? Optional.empty() : Optional.of(categories.get(0));
}
```
`lotCategory` es directo (`Optional.ofNullable(product.getLotCategory())`), sin necesidad de helper.

### 3. `CodeSequenceRepository` (puerto) + adapter JDBC

Sin cambios respecto al diseño previo — el mecanismo de secuencia atómica no depende de si la relación de categoría es muchos-a-muchos o FK directa. Puerto en `domain/model/.../codegen/gateways/CodeSequenceRepository.java`:
```java
public interface CodeSequenceRepository {
    int nextProductSequence(String idIndicator);
    int nextPackagingSequence();
    int nextFeedstockSequence();
    int nextBatchSequence(String lotFormat, int year);
}
```
Adapter `infrastructure/driven-adapters/jpa-repository/.../jpa/codegen/CodeSequenceRepositoryAdapter.java`, `JdbcTemplate`, atómico:
```sql
INSERT INTO inventory.code_sequences(scope, last_value) VALUES (?, ?)
ON CONFLICT (scope) DO UPDATE SET last_value = code_sequences.last_value + 1
RETURNING last_value
```
- `product:<indicador>` → seed = `MAX` del sufijo numérico de `final_product.id` que empiece por ese indicador, +1.
- `packaging:sequential` → seed = `MAX(sequential_code)` de `packaging`, +1.
- `feedstock` → seed = `MAX` numérico de `feedstocks.id`, arrancando en 1000 si no hay datos.
- `batch:<alimentos|cosmeticos>:<year>` → seed por defecto 1 (año nuevo = scope nuevo). Para configurar el arranque del primer año: `INSERT INTO inventory.code_sequences(scope, last_value) VALUES ('batch:alimentos:2026', 40);` antes de la primera orden del año → la primera orden genera `41`.

### 4. Estrategia de lote pluggable (`LotFormatStrategy`)

Sin cambios respecto al diseño previo, salvo que ahora se lee `product.getLotCategory().getLotFormat()` directo (sin filtrar listas). Paquete `domain/usecase/.../order/lot/`:
```java
public interface LotFormatStrategy {
    String generateBatchNumber(int year);                        // solo el número con padding, sin letra
    String buildFullLot(String batchNumber, String productCode);  // letra + batchNumber + sufijo del producto
}
```
- `AlimentosLotFormatStrategy`: `generateBatchNumber` = `%04d(nextBatchSequence("ALIMENTOS", year))`; `buildFullLot` = `"L" + batchNumber + productCode`.
- `CosmeticosLotFormatStrategy`: `generateBatchNumber` = `%03d(nextBatchSequence("COSMETICOS", year))`; `buildFullLot` = `"C-" + batchNumber + últimos2(productCode) + últimoDígito(year)` (verificado: `"C-"+"001"+"10"+"6"` = `"C-0011016"`, coincide con el ejemplo `C-001106` del usuario).

Wiring: `applications/app-service/.../config/LotFormatStrategyConfig.java` con `@Bean("ALIMENTOS")`/`@Bean("COSMETICOS")` → Spring inyecta `Map<String, LotFormatStrategy>` en `OrderProductionUseCase`. Agregar formato nuevo = un `@Bean` más + una fila nueva en `lot_categories` con ese `lotFormat`.

### 5. Cambios en use cases

**`CodeGeneratorUseCase`** (nuevo, `domain/usecase/.../codegen/`) — sin cambios respecto al diseño previo:
- `generateProductCode(String idIndicator)` → `idIndicator + %02d(next)`.
- `generatePackagingCode(PackagingCategory, String productCode)` → si `dependsOnProduct=true`, exige `productCode`; si no, `codeIndicator + %04d(nextPackagingSequence())` (**4 dígitos**) + valor crudo para `sequentialCode`.
- `generateFeedstockCode()` → `String.valueOf(nextFeedstockSequence())`.

**`FinalProductUseCase.createProduct`** — nueva firma sin `id`, y con `categoryId`/`lotCategoryId` en vez de `List<String> categories`:
```java
public FinalProduct createProduct(String name, Integer measurement, String unit, Integer minimumStandard,
        List<ProductPackaging> packagings, String categoryId, String lotCategoryId)
```
Resuelve `ProductCategory category = productCategoryRepository.findById(categoryId).orElseThrow(CategoryNotFoundException::new)` y `LotCategory lotCategory = lotCategoryRepository.findById(lotCategoryId).orElseThrow(...)`. Genera `id = codeGeneratorUseCase.generateProductCode(category.getIdIndicator())`. Setea `.categories(List.of(category))` (mantiene el tipo `List` del dominio) y `.lotCategory(lotCategory)`.

**`PackagingUseCase.save`** — firma `save(Packaging packaging, String categoryId, String productCode)`. Resuelve la categoría única, setea `.category(List.of(resolvedCategory))`, genera el id vía `CodeGeneratorUseCase.generatePackagingCode(resolvedCategory, productCode)`.

**`FeedstockUseCase.create`** — firma `create(FeedstockItem feedstock, String categoryId)` (`categoryId` opcional, ya que la categoría de feedstock no interviene en la generación del código). Si viene, resuelve y setea `.categories(List.of(resolved))`; genera id siempre vía `CodeGeneratorUseCase.generateFeedstockCode()`.

**`ProductCategoryUseCase.createCategory/updateCategory`** — nuevos parámetros `idIndicator, expirationMonths` (sin `categoryKind`/`lotFormat`, que ya no aplican aquí).

**Nuevo `LotCategoryUseCase`** (`domain/usecase/.../lot/LotCategoryUseCase.java`), calcado de `ProductCategoryUseCase` pero más simple: `createCategory(name, lotFormat)`, `updateCategory(id, name, lotFormat)`, `getById`, `getAllCategories`, `deleteCategory` (bloqueado si `existsProductsForLotCategory(id)`).

**`OrderProductionUseCase.createOrder`** — sin parámetros `batch`/`dateExpiration`. Añadir campo `Map<String, LotFormatStrategy> lotFormatStrategies`:
```java
int year = LocalDate.now().getYear();

List<LotCategory> lotCategories = productIds.stream()
        .map(pid -> Optional.ofNullable(productMap.get(pid).getLotCategory())
                .orElseThrow(() -> new CodeGenerationConfigurationException(
                        "El producto " + pid + " no tiene categoría de lote configurada.")))
        .toList();
Set<String> distinctFormats = lotCategories.stream().map(LotCategory::getLotFormat).collect(Collectors.toSet());
if (distinctFormats.size() != 1)
    throw new CodeGenerationConfigurationException("Todos los productos de la orden deben compartir la misma categoría de lote.");

LotFormatStrategy strategy = lotFormatStrategies.get(distinctFormats.iterator().next());
String batchNumber = strategy.generateBatchNumber(year);   // se guarda en Order.batch

int expirationMonths = productMap.get(baseProductId).getPresentationCategory()
        .map(ProductCategory::getExpirationMonths).orElse(6);
LocalDate dateExpiration = LocalDate.now().plusMonths(expirationMonths);
String expirationLabel = ExpirationLabelFormatter.format(dateExpiration);
```
En el loop existente que construye cada `OrderItem`, añadir `.batchLot(strategy.buildFullLot(batchNumber, pid))`. En `Order.builder()`: `.batch(batchNumber)`, `.dateExpiration(dateExpiration)`, `.expirationLabel(expirationLabel)`.

### 6. Cambios en DTOs / REST

**`CategoryRest.java`** — nueva sección "Lote" (`/api/categories/lot`), paralela a las 3 existentes:
- `dto/lotCategory/CreateLotCategoryDto.java`/`UpdateLotCategoryDto.java`: `name, lotFormat`.
- `dto/productCategory/CreateProductCategoryDto.java`/`UpdateProductCategoryDto.java` (nuevos, dedicados): `name, idIndicator, expirationMonths`.
- `dto/packagingCategory/CreatePackagingCategoryDto.java` (hoy sin uso — empezar a usarlo)/`UpdatePackagingCategoryDto.java`: añadir `codeIndicator, dependsOnProduct`.
- `ResponseCategoryDto`: ampliar con `idIndicator, expirationMonths, codeIndicator, dependsOnProduct, lotFormat` (nullable, según el tipo de categoría).

**Adapters de categoría** (`ProductCategoryRepositoryAdapter`, `PackagingCategoryRepositoryAdapter`, nuevo `LotCategoryRepositoryAdapter`): mapear los campos nuevos; `LotCategoryRepositoryAdapter` sigue el mismo patrón standalone que `ProductCategoryRepositoryAdapter` (no se folded dentro de otro adapter).

**`FinalProductAdapter` / `PackagingRepositoryAdapter` / `FeedstockRepositoryAdapter`** — el mapeo de categoría se simplifica de "recorrer lista re-consultando cada id" a un solo fetch/set por la FK directa; en `toDomain`, envolver el resultado único en `List.of(...)` (o `List.of()` si es null) para preservar el tipo `List` del dominio. `FinalProductAdapter` además mapea `lotCategory` (singular, sin envolver).

**`OrderAdapter`** — el mapeo de `OrderItem.finalProduct` debe incluir `categories`/`lotCategory` (necesarios para la validación de formato de lote y el cálculo de vencimiento en `createOrder`). Mapear también los nuevos campos `batchLot` (`OrderItemEntity`↔`OrderItem`) y `expirationLabel` (`OrderEntity`↔`Order`).

**`ProductRest` / `CreateProductDTO`**: quitar `id`. `categories: List<String>` con `@Size(min=1, max=1)` (sigue siendo arreglo, pero ahora obligatorio con exactamente 1 elemento). Añadir `String lotCategoryId` (nuevo, singular, `@NotBlank`). El controller desempaqueta `dto.categories().get(0)` y llama `finalProductUseCase.createProduct(dto.name(), ..., categoryId, dto.lotCategoryId())`.

**`PackagingRest` / `CreatePackagingDto`**: quitar `id`. `category: List<String>` con `@Size(min=1, max=1)`. Añadir `String productCode` (obligatorio solo si la categoría resuelta tiene `dependsOnProduct=true`). Call site: `packagingUseCase.save(packaging, dto.category().get(0), dto.productCode())`.

**`FeedstockRest` / `CreateFeedstockDto`**: quitar `id`. `category`/`categories: List<String>` con `@Size(max=1)` (opcional, 0 o 1 — el feedstock no depende de categoría para su código). Call site: `feedstockUseCase.create(feedstock, dto.categories().isEmpty() ? null : dto.categories().get(0))`.

Revisar los DTOs de **actualización** de estas tres entidades para confirmar que ninguno permite cambiar el `id` vía body.

### 7. Orden de producción — lote y vencimiento

**`CreateProductionOrderDTO`**: sin `batch` ni `date_expiration`. Queda `record CreateProductionOrderDTO(int quantityExpected, List<Products> products)`.

**`OrderProductionRest.save`**: quitar la generación de `batch`/`expiration` del controller; actualizar el call site de `createOrder(...)`.

**`ExpirationLabelFormatter`** (nuevo, `domain/model/.../util/`, sin dependencias de framework):
```java
"V." + {ENE,FEB,MAR,ABR,MAY,JUN,JUL,AGO,SEP,OCT,NOV,DIC}[mes-1] + " " + %02d(día) + "/" + %02d(año%100)
```
Verificado: 2 jul → `"V.JUL 02/25"`. Se calcula una sola vez en `OrderProductionUseCase.createOrder` y se persiste en `Order.expirationLabel`.

`OrderDetailDTO`/`OrderProductionListDTO`: exponer `expirationLabel` directamente desde `order.getExpirationLabel()`.

### 8. Listado de lotes dentro de una orden (sin endpoint de búsqueda separado)

No se crea un endpoint nuevo de búsqueda. El lote completo (`batchLot`) queda persistido en `items.batch_lot`, y se devuelve completo en los dos endpoints que ya existen — la "búsqueda" queda como un filtro que hace el frontend sobre esos datos ya cargados, no una consulta nueva al backend:
- **`OrderDetailDTO`** (detalle de una orden, `GET /api/orders/{id}`): añadir `List<LotDTO> lots` (record `LotDTO(String idFinalProduct, String batchLot)`), poblado directamente desde `order.getItems()`. El campo `batch` que ya existe en el DTO sigue expuesto tal cual (ahora es solo el consecutivo crudo, ej. `"0001"`).
- **`OrderProductionListDTO`** (listado de todas las órdenes, `GET /api/orders`): añadir el mismo campo `List<LotDTO> lots` a cada fila (hoy este DTO no trae los `items` de la orden — hay que extender el mapeo para incluirlos). El campo `batch` que ya existe también se mantiene.

## Resumen — relaciones y generación

| Relación | Antes | Ahora |
|---|---|---|
| `product ↔ product_categories` | muchos-a-muchos (`product_categorized`) | FK directa `final_product.category_id` (nullable en BD, requerida en DTO, máx. 1 en el arreglo) |
| `product ↔ lot_categories` | no existía | FK directa nueva `final_product.lot_category_id` (singular, requerida en DTO) |
| `packaging ↔ packaging_categories` | muchos-a-muchos (`packaging_categorized`) | FK directa `packaging.category_id` (requerida, máx. 1 en el arreglo) |
| `feedstock ↔ feedstock_categories` | muchos-a-muchos (`feedstock_categorized`) | FK directa `feedstocks.category_id` (opcional, máx. 1 en el arreglo) |

| Entidad | id/código en DTO | Generación |
|---|---|---|
| FinalProduct | eliminado | siempre vía `CodeGeneratorUseCase.generateProductCode` (usa `category.idIndicator`) |
| Packaging | eliminado | siempre vía `CodeGeneratorUseCase.generatePackagingCode` (usa `category.codeIndicator`/`dependsOnProduct`) |
| FeedstockItem | eliminado | siempre vía `CodeGeneratorUseCase.generateFeedstockCode` (no depende de categoría) |
| Order.batch / OrderItem.batchLot | no existe como input | siempre vía `LotFormatStrategy`, año-scoped (usa `product.lotCategory.lotFormat`) |

## Archivos críticos

- `domain/model/src/main/java/co/com/naturex/model/product/FinalProduct.java`, `ProductCategory.java`, `packaging/PackagingCategory.java`, `packaging/Packaging.java`, `order/Order.java`, `order/OrderItem.java` — campos nuevos
- `domain/model/src/main/java/co/com/naturex/model/lot/LotCategory.java` — modelo nuevo
- `domain/model/src/main/java/co/com/naturex/model/lot/gateways/LotCategoryRepository.java` — puerto nuevo
- `domain/model/src/main/java/co/com/naturex/model/codegen/gateways/CodeSequenceRepository.java` — puerto nuevo
- `infrastructure/driven-adapters/jpa-repository/src/main/java/co/com/naturex/jpa/lot/` — `LotCategoryEntity`, `LotCategoryJpaRepository`, `LotCategoryRepositoryAdapter` (nuevos)
- `infrastructure/driven-adapters/jpa-repository/src/main/java/co/com/naturex/jpa/codegen/CodeSequenceRepositoryAdapter.java` — adapter JDBC nuevo
- `infrastructure/driven-adapters/jpa-repository/src/main/resources/db/migration/V4__code_generation_and_expiration.sql` — migración nueva
- `domain/usecase/src/main/java/co/com/naturex/usecase/codegen/CodeGeneratorUseCase.java`, `usecase/lot/LotCategoryUseCase.java` — nuevos
- `domain/usecase/src/main/java/co/com/naturex/usecase/order/lot/` — `LotFormatStrategy`, `AlimentosLotFormatStrategy`, `CosmeticosLotFormatStrategy` (nuevos)
- `applications/app-service/src/main/java/co/com/naturex/config/LotFormatStrategyConfig.java` — wiring nuevo
- `domain/usecase/src/main/java/co/com/naturex/usecase/product/FinalProductUseCase.java`, `usecase/packaging/PackagingUseCase.java`, `usecase/feedstock/FeedstockUseCase.java`, `usecase/order/OrderProductionUseCase.java` — cambios de firma/lógica
- `domain/usecase/src/main/java/co/com/naturex/usecase/product/ProductCategoryUseCase.java`, `usecase/packaging/PackagingCategoryUseCase.java` — nuevos campos
- `infrastructure/entry-points/api-rest/src/main/java/co/com/naturex/api/CategoryRest.java`, `ProductRest.java`, `PackagingRest.java`, `FeedstockRest.java`, `OrderProductionRest.java` — DTOs y endpoints
- `infrastructure/driven-adapters/jpa-repository/src/main/java/co/com/naturex/jpa/product/FinalProductAdapter.java`, `jpa/packaging/PackagingRepositoryAdapter.java`, `jpa/feedstock/FeedstockRepositoryAdapter.java` — mapeo de FK simplificado
- `infrastructure/driven-adapters/jpa-repository/src/main/java/co/com/naturex/jpa/order/OrderAdapter.java`, `OrderItemEntity.java`, `OrderEntity.java` — mapeo de categorías en items, `batchLot`, `expirationLabel`

## Verificación

1. `./gradlew :domain:model:test :domain:usecase:test` — `CodeGeneratorUseCase`, las dos `LotFormatStrategy`, `ExpirationLabelFormatter` contra los ejemplos exactos (`2001`/`6002`, `V.JUL 02/25`, `C-0011016`), incluyendo reinicio anual del consecutivo de lote.
2. `./gradlew :infrastructure:driven-adapters:jpa-repository:test` — `CodeSequenceRepositoryAdapter` (incrementos concurrentes sin duplicados/huecos; seeds correctos; scope `batch:*:<year>` arranca en 1 o respeta la fila manual precargada).
3. `./gradlew :infrastructure:entry-points:api-rest:test` — DTOs de creación de Product/Packaging/Feedstock sin `id`; validación `@Size(min=1,max=1)`/`@NotBlank` en los campos de categoría.
4. `./gradlew :applications:app-service:test` — `ArchitectureTest.useCaseFinalFields` (regla dura): `CodeGeneratorUseCase`/`LotCategoryUseCase` con `@RequiredArgsConstructor` y solo campos `final`.
5. `./gradlew build` desde la raíz — detecta desalineación entre columnas de entidad y la migración `V4` (`hibernate.hbm2ddl.auto=validate`).
6. Antes de aplicar la migración: limpiar manualmente las categorías existentes en la BD local (ya confirmado por el usuario), y correr el grep de `product_categorized`/`packaging_categorized`/`feedstock_categorized` mencionado en la sección 1.
7. Prueba manual/API: crear `product_categories` con `idIndicator=20`; crear `lot_categories` con `lotFormat=ALIMENTOS`; crear producto asociando ambas → id `2001`; segundo producto misma categoría → `2002`. Crear orden con ese producto → `Order.batch="0001"`, `OrderItem.batchLot="0001"+idProducto`. Repetir con `lotFormat=COSMETICOS` verificando `C-0011016`. Verificar que una orden con productos de `lotCategory` distintas falla con `CodeGenerationConfigurationException`.

## Cambios sugeridos en el frontend

El frontend no vive en este repo, así que esto queda como guía de contrato de API + propuesta de UI para quien lo implemente — no se toca código de frontend como parte de este plan.

### 1. Formularios de categoría (creación y edición) — nuevos campos por tipo

Hoy probablemente existe un único formulario de categoría con solo "Nombre". Se sugiere que cada uno de los 4 tipos muestre campos adicionales específicos (el campo `type`/pestaña ya existe para distinguir Materia prima / Material de empaque / Producto — se agrega una 4ª pestaña "Categoría de lote"):

| Tipo | Campos actuales | Campos nuevos a agregar | Notas de UI |
|---|---|---|---|
| Materia prima (`/feedstock`) | Nombre | — (sin cambios) | — |
| Producto (`/product`) | Nombre | **Indicativo de id** (texto, exactamente 2 dígitos, ej. `20`) · **Meses de vencimiento** (numérico entero, ej. `4`) | Validar en el form que el indicativo sean 2 dígitos antes de enviar (mismo regex que valida el backend: `\d{2}`) |
| Material de empaque (`/packaging`) | Nombre | **Indicativo de código** (texto corto, 1-4 caracteres, ej. `ET`, `SA`, `E`) · **Depende del producto** (checkbox/toggle) | Si "Depende del producto" está activo, mostrar ayuda: "el código de este empaque se formará con este indicativo + el código del producto asociado" |
| **Categoría de lote (nuevo, `/lot`)** | — | Nombre · **Formato de lote** (select con las opciones registradas, hoy `ALIMENTOS` / `COSMETICOS`) | Idealmente el select se llena consultando al backend qué formatos están disponibles (evita hardcodear valores que puedan crecer); si no hay endpoint de "formatos soportados", se puede hardcodear la lista por ahora y quedar como deuda técnica documentada |

Sugerencia de reutilización: si hoy el frontend tiene un único componente de formulario de categoría parametrizado por `type`, basta con extender ese mismo componente agregando un `case` más (`lot`) y los campos condicionales de la tabla de arriba — no hace falta un componente nuevo desde cero.

### 2. Formularios de creación de Producto / Empaque / Materia prima

- **Quitar el campo "id"/"código"** de los tres formularios de creación — ya no lo acepta la API, se genera automáticamente. Mostrarlo como campo de solo lectura (no editable) una vez creado el registro, tomándolo de la respuesta del backend.
- **Selector de categoría: de multi-selección a selección única** en los tres formularios (antes se enviaba un arreglo de ids potencialmente múltiple; ahora la API exige como máximo 1). Cambiar el control de UI de "checkboxes"/"multi-select" a un `select`/`radio` simple.
  - Producto y Empaque: la categoría pasa a ser **obligatoria** (antes podía ir vacía).
  - Materia prima: la categoría se mantiene **opcional**.
- **Producto — nuevo campo obligatorio: "Categoría de lote"** (`lotCategoryId`), select simple, poblado desde `GET /api/categories/lot`.
- **Empaque — nuevo campo condicional: "Código de producto"** (`productCode`), mostrado/obligatorio solo cuando la categoría de empaque seleccionada tenga `dependsOnProduct = true`. Para esto el frontend necesita que la respuesta de `GET /api/categories/packaging` (o el combinado `GET /api/categories?type=packaging`) incluya el campo `dependsOnProduct` para decidir dinámicamente si mostrar el campo — ya contemplado en el `ResponseCategoryDto` ampliado del plan.

### 3. Formulario de creación de Orden de Producción

- **Quitar el campo "Lote"/"batch"** del formulario — ya no lo acepta la API (se ignoraba silenciosamente incluso antes de este cambio).
- **Quitar el campo "Fecha de vencimiento"** del formulario — ahora se calcula en el servidor según la categoría del producto base.
- Si el usuario intenta crear una orden mezclando productos que no comparten la misma categoría de lote, la API responderá `400` con `CodeGenerationConfigurationException` — asegurarse de que el manejo de errores genérico del formulario muestre ese mensaje (nuevo caso de error a contemplar en pruebas de UI).

### 4. Vista de detalle de Orden de Producción

- Mostrar el nuevo campo **`expirationLabel`** (ej. `V.JUL 02/25`) junto a la fecha de vencimiento, como la etiqueta lista para imprimir/rotular.
- Agregar una sección **"Lotes de la orden"** listando `lots: [{ idFinalProduct, batchLot }]` — un lote completo por producto/ítem de la orden (antes solo existía un único `batch` a nivel de orden).

### 5. Búsqueda de lotes — sin endpoint nuevo, es filtro de frontend

No hay endpoint de búsqueda en el backend. Como el listado de órdenes (`GET /api/orders`) ahora trae el arreglo `lots` completo por cada orden, el frontend puede implementar la búsqueda "por lote" como un filtro client-side sobre los datos ya cargados (ej. un campo de texto que filtra las filas cuyo `batchLot` contiene el término buscado), sin necesidad de una llamada adicional al backend. Si el volumen de órdenes crece demasiado para cargar todo de una vez, ahí sí valdría la pena reconsiderar un endpoint de búsqueda server-side — pero no se construye especulativamente ahora.

## Puntos abiertos
- Si se prefiere `NOT NULL` real en BD para `category_id`/`lot_category_id` (en vez de solo exigirlo en el DTO) — requeriría confirmar que `final_product`/`packaging` están vacías en el entorno donde se aplique la migración.
