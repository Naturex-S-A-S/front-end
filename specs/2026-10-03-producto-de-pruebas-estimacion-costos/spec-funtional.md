# Producto dummy para simulación de costos

## Contexto

Hoy el módulo de costos (`ProductCostUseCase.saveWithMaterials`/`saveWithPrice`)
solo puede costear productos reales: exige una `Formulation` activa (materia
prima) y valida que todos los `product_packaging` del producto estén cubiertos
en la solicitud (`validateAllMaterialsPresent`). El usuario quiere poder simular
un costo "desde cero" — eligiendo libremente cualquier combinación de materia
prima y empaque, sin que exista un producto real, una fórmula ni una relación
`product_packaging` de por medio.

La solución acordada es un **producto dummy único**, `"Producto de pruebas
Naturex"`, creado automáticamente al arrancar la aplicación (no se expone
ningún endpoint de creación manual para él, y no aparece en los listados
normales de productos). Sobre ese producto se habilita un flujo de costeo
paralelo a `saveWithPrice` que:

- No exige formulación ni `product_packaging` — el usuario indica libremente
  qué materiales usar y en qué cantidad.
- No usa el `measurement`/`unit` fijos del producto para escalar cantidades
  (eso ataría todos los costos futuros al peso usado hoy) — en su lugar,
  cada cálculo recibe explícitamente `unitGramsFinalProduct` (los gramos de
  la presentación que se está simulando), tal como ya se persiste ese campo
  en `ProductCostSnapshot`.
- Aplica una regla nueva y **general para todo el módulo de costos**: si
  `unitGramsFinalProduct` resuelto es menor a 100, el CÁLCULO usa 100 en su
  lugar — pero el valor real solicitado/de la presentación sigue
  guardándose sin alterar en `unitGramsFinalProduct`, y se añade un campo
  nuevo (`unitGramsFinalProductUsed`) que registra el valor efectivamente
  usado en la fórmula. Cuando el valor real es ≥100, ambos campos quedan
  iguales. Esto también corrige `measurementToKg()` para productos reales
  con presentaciones muy pequeñas.

## 1. Modelo de datos — marcar el producto dummy

**Migración Flyway** (el proyecto usa `ddl-auto: validate`, confirmado en
`applications/app-service/src/main/resources/application.yaml:29` — los
cambios de esquema van por migración, no por Hibernate auto-DDL). Crear
`infrastructure/driven-adapters/jpa-repository/src/main/resources/db/migration/V4__final_product_test_flag.sql`:

```sql
ALTER TABLE inventory.final_product
    ADD COLUMN is_test_product boolean NOT NULL DEFAULT false;
```

**Dominio** — `domain/model/src/main/java/co/com/naturex/model/product/FinalProduct.java`:
agregar `private Boolean isTestProduct;`.

**Entidad JPA** — `infrastructure/driven-adapters/jpa-repository/.../product/FinalProductEntity.java`:
agregar `@Column(name = "is_test_product", nullable = false) @Builder.Default private Boolean isTestProduct = false;`.

**Adapter** — `FinalProductAdapter.java`:
- `toEntity`/`toDomain`: mapear `isTestProduct` (default `false` si viene `null`
  desde el dominio, para no romper `createProduct`/`updateProduct` existentes
  que nunca setean este campo).
- `findAll(...)`: el dummy **no** se excluye de forma incondicional. Los
  selectores de producto usados para crear kardex o formulación deben seguir
  sin mostrarlo, pero el selector de producto del módulo de costos sí
  necesita poder ofrecerlo como opción (para poder elegirlo y simular un
  costo). Se resuelve con un parámetro explícito, no con una exclusión fija
  — ver "Parámetro `includeTestProducts`" más abajo.
- Agregar `Optional<FinalProductEntity> findFirstByIsTestProductTrue();` en
  `FinalProductJpaRepository` — es la búsqueda que usará el flujo de costos
  para resolver el producto dummy (nunca por nombre, para no depender de un
  string ni de la ausencia de constraint `UNIQUE(name)`).
- `AND p.isTestProduct = false` en las JPQL de `findActiveProductsWithPackaging()`
  y `findActiveRelatedProductsByProductId(...)` **sí** se mantiene fijo (sin
  parámetro) — estos alimentan flujos de formulación/empaque donde el dummy
  nunca debe aparecer bajo ninguna circunstancia, a diferencia del selector
  general de producto.

**Puerto** — `domain/model/src/main/java/co/com/naturex/model/product/gateways/FinalProductRepository.java`:
agregar `Optional<FinalProduct> findTestProduct();` y cambiar la firma de
`findAll(Boolean active)` a `findAll(Boolean active, boolean includeTestProducts)`.

### Parámetro `includeTestProducts` — quién ve el producto dummy y quién no

En vez de un endpoint nuevo dedicado a "listar productos costeables", se
añade un parámetro explícito al método de listado ya existente, en la misma
línea que el `active` que ya recibe — así el mismo componente de selector de
producto del frontend se reutiliza en todas las pantallas, y solo la
instancia que usa el módulo de costos pasa `includeTestProducts=true`.

- `FinalProductRepository.findAll(Boolean active, boolean includeTestProducts)`
  — cuando `includeTestProducts=false` (el default), la query excluye
  `is_test_product = true`; cuando es `true`, no filtra por ese campo.
- `FinalProductUseCase.getAllProducts(Boolean active, boolean includeTestProducts)`
  y `getAllBasicInfo(boolean includeTestProducts)` — propagan el flag.
- REST — `infrastructure/entry-points/api-rest/.../api/ProductRest.java`:
  - `GET /api/products` (línea ~59-64, `getAllProducts`): agregar
    `@RequestParam(name = "includeTestProducts", required = false, defaultValue = "false") boolean includeTestProducts`.
  - `GET /api/products/list` (línea ~66-79, `getAllBasicList`): este es el
    endpoint que devuelve `ProductBasicInfoDTO` (id, name, label) y es, por su
    forma, el candidato más probable a ser el selector compartido que usan
    los formularios de kardex y de formulación — agregar el mismo parámetro
    `includeTestProducts` (default `false`).
  - El frontend del módulo de costos es el único que debe invocar
    `GET /api/products/list?includeTestProducts=true` para que
    "Producto de pruebas Naturex" aparezca como opción seleccionable junto a
    los productos reales; kardex y formulación siguen llamando sin el
    parámetro (o con `false`) y nunca lo ven.

Importante: esto solo controla **visibilidad en el selector**. El cálculo de
costo del producto dummy siempre pasa por los endpoints dedicados de §4.3
(`/api/costs/dummy-product/...`), nunca por `saveWithPrice`/`saveWithMaterials`
genérico — ese flujo seguiría fallando con `FormulationNotFoundException`
porque el dummy no tiene formulación. El frontend decide, según el id
seleccionado, si enruta hacia el flujo de costos normal o hacia el flujo
dummy.

## 2. Creación automática del producto dummy

**`FinalProductUseCase.java`** — nuevo método, idempotente (find-or-create):

```java
public FinalProduct ensureTestProduct() {
    return finalProductRepository.findTestProduct().orElseGet(() -> {
        FinalProduct dummy = FinalProduct.builder()
                .id("TEST-" + Instant.now().getEpochSecond())
                .name("Producto de pruebas Naturex")
                .measurement(100)
                .unit("g")
                .active(false)
                .isTestProduct(true)
                .dateCreated(LocalDateTime.now())
                .build();
        return finalProductRepository.save(dummy);
    });
}
```

- El `id` sigue el mismo patrón de código autogenerado que ya usan
  `FeedstockUseCase` (`"F-" + Instant.now().getEpochSecond()`, línea ~40) y
  `PackagingUseCase` (`"P-" + Instant.now().getEpochSecond()`, línea ~31) —
  único porque el timestamp en segundos no se repite entre llamadas reales.
- `measurement=100`/`unit="g"` son solo un placeholder para satisfacer el
  `NOT NULL` de la tabla; el flujo de costeo del dummy **nunca** los lee (usa
  `unitGramsFinalProduct` de cada request, ver §4).
- `active=false` y `isTestProduct=true`: no debe aparecer en ningún listado
  de productos (confirmado con el usuario), y el flujo de costeo del dummy no
  depende de que el producto esté activo.
- También añadir `createProduct(...)` → construir explícitamente con
  `.isTestProduct(false)` para dejar el flag explícito en la creación normal
  (no depender solo del default del builder de la entidad).

**Arranque de la app** — nuevo `applications/app-service/src/main/java/co/com/naturex/config/TestProductInitializer.java`:

```java
@Component
@RequiredArgsConstructor
public class TestProductInitializer implements ApplicationRunner {
    private final FinalProductUseCase finalProductUseCase;

    @Override
    public void run(ApplicationArguments args) {
        finalProductUseCase.ensureTestProduct();
    }
}
```

`FinalProductUseCase` ya es un bean auto-escaneado por
`UseCasesConfig` (`@ComponentScan` sobre `co.com.naturex.usecase` con patrón
`^.+UseCase$`, `applications/app-service/.../config/UseCasesConfig.java`), así
que la inyección por constructor funciona sin wiring adicional.

**Defensa adicional en tiempo de request**: el nuevo caso de uso de costeo
del dummy (§4) también llama `ensureTestProduct()` (no un `findTestProduct().orElseThrow(...)`)
antes de calcular. Es la misma operación idempotente de arranque, así que el
costo extra es una sola consulta `SELECT`; esto cubre el caso borde de que la
BD se reinicie sin reiniciar el server, cumpliendo literalmente "cuando se
inicie este proceso de costos se debe validar que el producto exista" sin
contradecir la estrategia de creación en arranque ya elegida.

## 3. Regla general de piso de 100g — y trazabilidad del valor real

El piso aplica al **cálculo**, no al dato guardado: `unitGramsFinalProduct`
en `ProductCostSnapshot` debe seguir reflejando el valor real (de la
presentación del producto, o el que puso el usuario en el flujo dummy),
aunque sea menor a 100. Para no perder qué valor se usó realmente en la
fórmula, se añade un campo nuevo, `unitGramsFinalProductUsed`, que guarda el
valor con el piso ya aplicado (≥100 siempre). Cuando el real ya es ≥100,
`unitGramsFinalProductUsed == unitGramsFinalProduct`.

**Migración Flyway** — nuevo archivo
`infrastructure/driven-adapters/jpa-repository/src/main/resources/db/migration/V5__product_cost_snapshot_grams_used.sql`:

```sql
ALTER TABLE costs.product_cost_snapshot
    ADD COLUMN unit_grams_final_product_used double precision;
```

**Dominio** — `domain/model/src/main/java/co/com/naturex/model/costs/ProductCostSnapshot.java`:
agregar `private Double unitGramsFinalProductUsed;` junto al `unitGramsFinalProduct`
ya existente.

**Entidad JPA** — `infrastructure/driven-adapters/jpa-repository/.../costs/ProductCostSnapshotEntity.java`
(línea ~44, junto a `unitGramsFinalProduct`): agregar
`@Column(name = "unit_grams_final_product_used") private Double unitGramsFinalProductUsed;`,
y mapear el campo en el adapter (`ProductCostSnapshotRepositoryAdapter` toEntity/toDomain).

**DTO** — `ProductCostSnapshotDTO` (record, en
`infrastructure/entry-points/api-rest/.../dto/costs/`): agregar
`Double unitGramsFinalProductUsed` al record y mapearlo en `toSnapshotDTO(...)`
(`ProductCostRest.java`).

**`ProductCostUseCase.java`**: agregar constante
`private static final double MIN_UNIT_GRAMS_FINAL_PRODUCT = 100.0;`. En vez
de que `measurementToKg` aplique el piso silenciosamente (perdiendo el valor
real), separarlo en dos pasos explícitos en cada flujo:

```java
private double measurementToKg(FinalProduct product) {
    if (product.getMeasurement() == null || product.getUnit() == null) return 0.0;
    return switch (product.getUnit().toLowerCase()) {
        case "kg", "l" -> product.getMeasurement();
        default -> product.getMeasurement() / 1000.0; // g, ml, y cualquier otro
    };
}
```
(sin piso — devuelve el kg real, incluso si es menor a 0.1 kg / 100g)

Y en cada punto donde hoy se hace `double measurementKg = measurementToKg(product);`
(líneas 78, 240, 289, 438, 591 según lectura actual de `estimate()`,
`createOrderCloseSnapshot()` ×2, `saveWithMaterials()`, `updateWithMaterials()`),
cambiar a:

```java
double rawMeasurementKg = measurementToKg(product);
double measurementKg = Math.max(rawMeasurementKg, MIN_UNIT_GRAMS_FINAL_PRODUCT / 1000.0);
double rawGrams = rawMeasurementKg * 1000.0;      // -> unitGramsFinalProduct (real, sin piso)
double measurementG = measurementKg * 1000.0;     // -> unitGramsFinalProductUsed y base de todos los cálculos (con piso)
```

Todas las fórmulas de escalado (`quantityKg`, `stdQuantityG`,
`computeCifTypeAverages(...)`, etc.) siguen usando `measurementKg`/`measurementG`
(el valor con piso) exactamente como antes — lo único que cambia es que ahora
también se conserva `rawGrams` para persistirlo. En cada builder de
`ProductCostSnapshot` de los cuatro flujos, setear:
```java
.unitGramsFinalProduct(rawGrams)
.unitGramsFinalProductUsed(measurementG)
```
en vez de la única línea `.unitGramsFinalProduct(measurementKg * 1000.0)` que
hay hoy (líneas 174, 372, 521, 675).

El fallback nulo de `measurementToKg` (producto sin `measurement`/`unit`)
pasa a devolver `0.0` en vez de `0.001` — ya no necesita simular un piso él
mismo, porque el `Math.max(...)` de arriba se encarga en el único punto
donde se usa.

El flujo del dummy (§4) no pasa por `measurementToKg` (no hay
`FinalProduct.measurement` real que usar) — ahí `rawGrams` es directamente
el `unitGramsFinalProduct` del request (puede ser <100) y `measurementG` es
`Math.max(rawGrams, MIN_UNIT_GRAMS_FINAL_PRODUCT)`, con la misma constante.

## 4. Nuevo flujo de costeo para el producto dummy

### 4.1 Modelo de request — reutiliza `MaterialCostInput` tal cual

`domain/model/src/main/java/co/com/naturex/model/costs/MaterialCostInput.java`
ya tiene exactamente los campos necesarios (`idMaterial`, `materialType`
`"feedstock"|"packaging"`, `quantity`, `unitCost`) — no requiere cambios.

### 4.2 `ProductCostUseCase` — nuevo método

Añadir junto a `saveWithMaterials`/`updateWithMaterials` (mismo archivo, para
reutilizar sin cambiar visibilidad los helpers privados `sumMaterialField`,
`computeCifAverage`, `computeCifTypeAverages`, `computeSuggestedPricing`,
`defaultConfig`):

```java
public ProductCostSnapshot saveDummyProductCost(Double unitGramsFinalProduct, Integer units,
        List<MaterialCostInput> inputMaterials, boolean persist, boolean isDefinitive,
        String idUser, String nameUser, String notes)
```

Lógica (espejo de `saveWithMaterials`, líneas ~420-563, con dos diferencias
deliberadas: sin `validateAllMaterialsPresent` — porque no hay fórmula ni
`product_packaging` de referencia contra qué validar — y sin persistir cuando
`persist=false`, para dar soporte a una vista previa en tiempo real):

1. `FinalProduct product = finalProductUseCase.ensureTestProduct();` (o
   inyectar `FinalProductRepository` directamente si se prefiere no acoplar
   con el use case de producto — cualquiera de las dos formas es válida, usar
   la que ya siga el patrón de inyección del resto del archivo).
2. `double rawGrams = unitGramsFinalProduct;` (el valor real pedido, puede
   ser <100) → `double effectiveGrams = Math.max(rawGrams, MIN_UNIT_GRAMS_FINAL_PRODUCT);`
   (el valor con el piso aplicado, siempre ≥100) → `measurementKg = effectiveGrams / 1000.0`;
   `quantityKg = units * measurementKg`. **Todos** los cálculos de este método
   usan `effectiveGrams`/`measurementKg`; `rawGrams` solo se guarda al final
   en `unitGramsFinalProduct` del snapshot (ver paso 7).
3. Cargar `CostCalcConfig` igual que `saveWithMaterials` (`defaultConfig()`
   de fallback).
4. Iterar `inputMaterials` filtrando `materialType.equals("feedstock")`:
   misma fórmula que `saveWithMaterials` (líneas 448-470) pero sustituyendo
   `measurementG` (que ahí sale del producto) por `effectiveGrams` — el
   material sigue reportando exactamente los mismos tres niveles de costo
   que ya expone `ProductCostSnapshotMaterial`/`SnapshotMaterialDTO` para
   productos reales: `cost` (costo por gramo, = `input.unitCost`), `baseCost`
   (costo de la receta base de 100g, = `unitCost * baseQuantityG`) y
   `stdTotalCost`/`realTotalCost` (costo total ya escalado a los gramos
   efectivos del producto y a `units`):
   `baseQuantityG = input.quantity` (g por cada 100g base, tal como ya
   funciona la fórmula real) → `stdQuantityG = baseQuantityG/100 * effectiveGrams * units`
   → `stdTotalCost = stdQuantityG * input.unitCost`.
5. Iterar `inputMaterials` filtrando `materialType.equals("packaging")`:
   misma fórmula que `saveWithMaterials` (líneas 472-496) sin cambios —
   `quantity` sigue siendo unidades de empaque por unidad de producto final,
   **no** escalado por gramos (empaque no se diluye con el peso; decisión
   confirmada con el usuario para mantener consistencia con el resto del
   sistema).
6. Agregar totales (`sumMaterialField`), CIF (`computeCifAverage`,
   `computeCifTypeAverages(effectiveGrams)`), y `computeSuggestedPricing` —
   idéntico a `saveWithMaterials`.
7. Construir `ProductCostSnapshot` con `idFinalProduct = product.getId()`,
   `idOrder = null`, `idVersion = null`, `snapshotType = "estimation"`,
   `status = !persist ? "transient" : (isDefinitive ? "final" : "draft")`,
   `unitGramsFinalProduct = rawGrams` (valor real, sin piso),
   `unitGramsFinalProductUsed = effectiveGrams` (valor con piso, el usado en
   el cálculo — ver §3), `materialIncomplete = false`,
   `cifIncomplete = cif.periodsUsed() == 0`.
8. Si `persist`, `snapshotRepository.save(snapshot)`; si no, devolver el
   snapshot sin persistir (igual que `estimate(..., save=false, ...)`).

Añadir también `updateDummyProductCost(Integer snapshotId, Double
unitGramsFinalProduct, Integer units, List<MaterialCostInput> inputMaterials,
boolean isDefinitive, String idUser, String nameUser, String notes)`, espejo
de `updateWithMaterials` (bloquea con `SnapshotNotEditableException` si
`status.equals("final")`, reutiliza `dateSnapshot` existente, llama
`snapshotRepository.update(...)`).

### 4.3 REST — `ProductCostRest.java`

Mismo patrón de orquestación que `saveWithPrice`/`updateWithPrice` (líneas
132-175: el controlador llama primero al use case de costos y luego a
`productPriceUseCase.registerOrUpdatePrice(snapshotId, price, snapshot)` —
`ProductCostUseCase` y `ProductPriceUseCase` nunca se llaman entre sí).

Nuevo DTO — `infrastructure/entry-points/api-rest/.../dto/costs/DummyProductCost.java`,
mismo shape que `ProductPriceCost` pero sin `idFinalProduct` (el producto es
implícito) y con `unitGramsFinalProduct` explícito:

```java
public record DummyProductCost(
    @NotNull @Positive Double unitGramsFinalProduct,
    @Positive int units,
    @NotNull Double wastePct,
    Double taxPct,
    Double commissionPct,
    @NotNull Double finalPrice,
    boolean isDefinitive,
    String notes,
    @NotNull @Size(min = 1) List<@Valid MaterialUsed> materials
) {
    public record MaterialUsed(
        @NotNull String idMaterial,
        @NotBlank String materialType,
        @NotNull Double quantity,
        @NotNull Double unitCost
    ) {}
}
```

Nuevos endpoints en `ProductCostRest.java`:

- `POST /api/costs/dummy-product/estimate` — vista previa en tiempo real, sin
  persistir: llama `saveDummyProductCost(..., persist=false, isDefinitive=false, ...)`
  y luego `productPriceUseCase.previewFromSnapshot(snapshot)` (igual que el
  `GET .../estimate` existente, líneas 71-85) para devolver también el precio
  sugerido sin guardar nada. Esto es lo que el frontend golpea mientras el
  usuario ajusta materiales/cantidades para el "realtime update" que describe
  el pedido.
- `POST /api/costs/dummy-product/save` — persiste: llama
  `saveDummyProductCost(..., persist=true, ...)`, construye el `ProductPrice`
  igual que `buildPrice(...)` (líneas 179-202, usando
  `snapshot.getIdFinalProduct()` en vez del `productId` de path) y
  `productPriceUseCase.registerOrUpdatePrice(...)`. Responde
  `ProductCostAndPriceDTO`, igual que `saveWithPrice`.
- `PUT /api/costs/dummy-product/snapshot/{snapshotId}` — espejo de
  `updateWithPrice` (líneas 154-175) llamando `updateDummyProductCost`.

Reutilizar los mappers privados existentes (`toMaterialInputs`, `toPriceDTO`,
`toSnapshotDTO`) — no requieren cambios, ya trabajan sobre los tipos de
dominio genéricos (`MaterialCostInput`, `ProductCostSnapshot`, `ProductPrice`).

### 4.4 `findLatestPerProduct` — excluir el dummy de la vista agregada

`ProductCostSnapshotJpaRepository.findLatestPerProduct()` (JPQL actual, línea
18-20) alimenta `GET /api/costs/products/latest`, un listado por producto —
el dummy no debe aparecer ahí (es igual de "no-catálogo" que el resto de
listados de producto). Agregar exclusión por subquery, sin parámetros nuevos:

```java
@Query("SELECT s FROM ProductCostSnapshotEntity s WHERE s.dateSnapshot = " +
       "(SELECT MAX(s2.dateSnapshot) FROM ProductCostSnapshotEntity s2 WHERE s2.idFinalProduct = s.idFinalProduct) " +
       "AND s.idFinalProduct NOT IN (SELECT p.id FROM FinalProductEntity p WHERE p.isTestProduct = true)")
```

`GET /api/costs/products/{productId}/snapshots` y `GET /api/costs/snapshots/{id}`
no se tocan — deben seguir funcionando cuando se consulta explícitamente el
id del producto dummy (es el historial propio de sus simulaciones).

## 5. Endpoints de precio de referencia para el selector de materiales (solo módulo de costos)

El picker de materiales del flujo dummy (y en general cualquier pantalla del
módulo de costos) necesita mostrarle al usuario el precio actual por gramo
(materia prima) o por unidad (empaque) de cada material, para que pueda
decidir qué `unitCost` escribir en `MaterialCostInput`. Los endpoints ya
existentes `GET /api/feedstock/list` y `GET /api/packaging/list` no sirven
para esto a propósito: devuelven solo `{id, name, label}` (sin costo) porque
los usa el resto de la aplicación (selects de kardex, formulación, etc.) y
no deben exponer información de costo/valor de inventario fuera del módulo
de costos. Por eso van dos endpoints **nuevos y separados**, bajo
`/api/costs`, no una variante del `/list` genérico.

La fórmula es la que ya existe como *getter* en los modelos de dominio — no
hay que calcular nada nuevo, solo exponerlo:
- Materia prima: `FeedstockItem.getChargeG()` = `charge / quantityG`
  (`domain/model/.../feedstock/FeedstockItem.java:50-53`) → precio por gramo.
- Empaque: `Packaging.getChargeU()` = `charge / quantity`
  (`domain/model/.../packaging/Packaging.java:32-37`) → precio por unidad.

(Nota: esto es el "promedio ponderado actual", `charge` ya es el valor
monetario total del inventario disponible dividido entre lo disponible — es
exactamente lo mismo que documenta el skill `costs-module` §2.1/§2.2. No
incluye el *fallback* a `feedstock_history`/`packaging_history` que sí usan
internamente `estimate()`/`saveWithMaterials()` vía `resolveChargeKg`/
`resolvePackagingCostPerUnit` — si un material no tiene stock actual, este
endpoint mostrará `null`/`0`. Se deja así por ahora porque el pedido es
explícitamente "el cargo o valor actual dividido el material disponible";
si luego se quiere que el picker también muestre precio histórico para
materiales sin stock, es un ajuste aparte.)

**DTOs nuevos** — `infrastructure/entry-points/api-rest/.../dto/costs/`:

```java
public record FeedstockPriceDTO(String id, String name, Double pricePerGram) {}
public record PackagingPriceDTO(String id, String name, Double pricePerUnit) {}
```

**`ProductCostRest.java`** — agregar como nuevas dependencias del
constructor `FeedstockUseCase` y `PackagingUseCase` (ya son beans
auto-escaneados, mismo mecanismo que el resto de use cases), y dos
endpoints:

```java
@GetMapping("/feedstock/list")
@RequiresAuthentication
public ResponseEntity<List<FeedstockPriceDTO>> listFeedstockPrices() {
    List<FeedstockPriceDTO> response = feedstockUseCase.getAll(true, null, null, "name")
            .stream()
            .map(f -> new FeedstockPriceDTO(f.getId(), f.getName(), f.getChargeG()))
            .toList();
    return ResponseEntity.ok(response);
}

@GetMapping("/packaging/list")
@RequiresAuthentication
public ResponseEntity<List<PackagingPriceDTO>> listPackagingPrices() {
    List<PackagingPriceDTO> response = packagingUseCase.getAll(true, null, null, null, "name")
            .stream()
            .map(p -> new PackagingPriceDTO(p.getId(), p.getName(), p.getChargeU()))
            .toList();
    return ResponseEntity.ok(response);
}
```

Importante: se reutiliza `FeedstockUseCase.getAll(...)`/`PackagingUseCase.getAll(...)`
(las mismas que alimentan `GET /api/feedstock` y `GET /api/packaging`
completos) y **no** `getAllBasic()` — `PackagingUseCase.getAllBasic()`
(`domain/usecase/packaging/PackagingUseCase.java:144-150`) descarta
`charge`/`quantity` a propósito (solo arma `{id, name}`), así que con esa
lista `getChargeU()` siempre daría `0.0`. `getAll(...)` sí trae el objeto
completo con `charge`/`quantity` poblados.

## Archivos a tocar (resumen)

| Archivo | Cambio |
|---|---|
| `db/migration/V4__final_product_test_flag.sql` | nueva columna `is_test_product` |
| `db/migration/V5__product_cost_snapshot_grams_used.sql` | nueva columna `unit_grams_final_product_used` |
| `model/costs/ProductCostSnapshot.java` | + `unitGramsFinalProductUsed` |
| `jpa/costs/ProductCostSnapshotEntity.java` + adapter | + columna mapeada |
| `dto/costs/ProductCostSnapshotDTO.java` | + campo `unitGramsFinalProductUsed` |
| `model/product/FinalProduct.java` | + `isTestProduct` |
| `model/product/gateways/FinalProductRepository.java` | + `findTestProduct()`, `findAll` con `includeTestProducts` |
| `jpa/product/FinalProductEntity.java` | + columna mapeada |
| `jpa/product/FinalProductJpaRepository.java` | queries condicionales por `includeTestProducts`, `findFirstByIsTestProductTrue`, exclusión fija en `findActiveProductsWithPackaging`/`findActiveRelatedProductsByProductId` |
| `jpa/product/FinalProductAdapter.java` | mapping + `findAll(active, includeTestProducts)` |
| `usecase/product/FinalProductUseCase.java` | + `ensureTestProduct()`, `createProduct` explícito `isTestProduct(false)`, `getAllProducts`/`getAllBasicInfo` con `includeTestProducts` |
| `api/ProductRest.java` | `GET /api/products` y `GET /api/products/list` con nuevo query param `includeTestProducts` |
| `config/TestProductInitializer.java` (nuevo) | seed en arranque |
| `usecase/costs/ProductCostUseCase.java` | piso 100g en `measurementToKg`, + `saveDummyProductCost`/`updateDummyProductCost` |
| `dto/costs/DummyProductCost.java` (nuevo) | request DTO |
| `api/ProductCostRest.java` | 3 endpoints nuevos bajo `/api/costs/dummy-product` + 2 endpoints de precio (`/api/costs/feedstock/list`, `/api/costs/packaging/list`), inyectando `FeedstockUseCase`/`PackagingUseCase` |
| `dto/costs/FeedstockPriceDTO.java`, `dto/costs/PackagingPriceDTO.java` (nuevos) | DTOs de precio por gramo/unidad |
| `jpa/costs/ProductCostSnapshotJpaRepository.java` | excluir dummy de `findLatestPerProduct` |

## Verificación

1. `./gradlew :app-service:test --tests "co.com.naturex.ArchitectureTest"` —
   confirma que no se violan las reglas de dependencia entre capas (todo el
   nuevo código de dominio queda en `usecase`/`model`, sin deps de framework).
2. `./gradlew build` completo (no hay tests unitarios de costos, ver skill
   `costs-module` §9).
3. Levantar con `./gradlew :app-service:bootRun` y confirmar en logs/BD que
   se creó un único `final_product` con `is_test_product=true` tras el
   arranque; reiniciar de nuevo y confirmar que NO se duplica.
4. `GET /api/products`, `GET /api/products?active=true` y
   `GET /api/products/list` (sin `includeTestProducts`) — confirmar que el
   producto dummy NO aparece. Repetir `GET /api/products/list?includeTestProducts=true`
   y confirmar que SÍ aparece junto a los productos reales.
5. Simular vía `POST /api/costs/dummy-product/estimate` con 2-3 materiales
   (mezcla feedstock/packaging) y `unitGramsFinalProduct` variando (ej. 50,
   150) — confirmar que con 50 el snapshot devuelto trae
   `unitGramsFinalProduct=50` (valor real, sin tocar) y
   `unitGramsFinalProductUsed=100` (piso aplicado en el cálculo), y que con
   150 ambos campos quedan en 150. Confirmar también que dos llamadas con
   distinto `unitGramsFinalProduct` no interfieren entre sí (nada queda
   "pegado" al producto).
6. `POST /api/costs/dummy-product/save` con `isDefinitive=false` → confirmar
   snapshot `status=draft`, editable vía `PUT .../dummy-product/snapshot/{id}`;
   luego con `isDefinitive=true` → confirmar que un intento posterior de
   editar ese snapshot lanza `SnapshotNotEditableException` (409), igual que
   el flujo real.
7. `GET /api/costs/products/latest` — confirmar que el producto dummy no
   aparece en el listado agregado, pero `GET /api/costs/products/{dummyId}/snapshots`
   sí muestra su propio historial.
8. `GET /api/costs/feedstock/list` y `GET /api/costs/packaging/list` —
   confirmar que devuelven `pricePerGram`/`pricePerUnit` coherentes con
   `charge/quantityG` y `charge/quantity` de un material conocido (comparar
   contra lo que devuelve `GET /api/feedstock/{id}` / `GET /api/packaging/{id}`),
   y que `GET /api/feedstock/list` / `GET /api/packaging/list` (los
   genéricos, ya existentes) siguen sin exponer ningún campo de precio.
9. Para un producto real existente con `measurement < 100` (si existe alguno
   en los datos de prueba), recalcular su costo vía `estimate` y confirmar
   que `unitGramsFinalProduct` sigue mostrando el `measurement` real del
   producto (sin piso) y `unitGramsFinalProductUsed` sube a 100, y que los
   montos de costo se calcularon con 100g — validar manualmente con la
   calculadora siguiendo las fórmulas del skill `costs-module` §3.1 antes de
   dar por buena la regla transversal.
