# Producto dummy para simulación de costos — adaptación frontend

| | |
|---|---|
| **Fecha** | 2026-10-03 |
| **Estado** | `aprobada` |
| **Alcance de este repo** | Toda la spec. Cambios 100% frontend. |
| **Spec upstream (autoritativa)** | [`spec-funtional.md`](./spec-funtional.md) — backend. Define el contrato, las migraciones y los endpoints. Esta spec no lo contradice: lo consume. |
| **Plan de ejecución** | [`plan.md`](./plan.md) |
| **Verificación manual** | [`QA.md`](./QA.md) |

## Contexto

Hoy el módulo de costos solo puede costear productos reales: el estimate llega del backend ya calculado (materiales, CIF y totales) y el cliente únicamente edita la cantidad base de cada material.

Se necesita simular el costo "desde cero" — elegir libremente cualquier combinación de materia prima y empaque, sin que exista un producto real, una formulación ni una relación `product_packaging`. Para eso el backend crea un producto dummy único, *"Producto de pruebas Naturex"*, y expone endpoints dedicados bajo `/api/costs/dummy-product/`.

Detalle completo del diseño backend en [`spec-funtional.md`](./spec-funtional.md). Esta spec cubre solo qué hace el frontend con ese contrato.

## Decisiones confirmadas

| # | Decisión | Por qué |
|---|---|---|
| 1 | **El cálculo es del backend.** Cada cambio de materiales o cantidades dispara `POST /api/costs/dummy-product/estimate` (sin persistir) y el frontend renderiza lo que vuelve. | No duplicar la matemática del negocio. Un solo origen de verdad elimina la divergencia entre cliente y backend. |
| 2 | El frontend detecta el modo por el flag **`isTestProduct`** del listado de productos. | Definido en `V4__final_product_test_flag.sql`. |
| 3 | El dummy se pide **solo desde el módulo de costos**, con un `queryKey` propio. | `useGetProductList` tiene 12 consumidores con un `queryKey` compartido: agregar el parámetro ahí filtraría el dummy a formulación, kardex y empaque — lo que la spec upstream prohíbe explícitamente (§1). |
| 4 | **`units` y `unitGramsFinalProduct` los tipea el usuario**, no vienen del producto. | La spec upstream los recibe como parámetros del request. El dummy tiene `measurement=100`/`unit="g"` solo para satisfacer el `NOT NULL`, y el flujo nunca los lee. |
| 5 | Se agregan al form los campos **unidades** y **gramos por unidad**, hoy inexistentes. | `EstimateForm.tsx:49-68` tiene el input de unidades comentado. Ambos son obligatorios en modo dummy (`@Positive` en el DTO). |
| 6 | El precio de cada material se pide a los endpoints **nuevos** `/api/costs/feedstock/list` y `/api/costs/packaging/list`, **no** a los `/list` genéricos. | La spec upstream (§5) los creó aparte a propósito: los genéricos devuelven `{id, name, label}` sin costo, para no exponer valor de inventario fuera del módulo de costos. |
| 7 | **El precio de cada fila es editable por el usuario**, prellenado con el del endpoint. | `MaterialUsed.unitCost` es `@NotNull`, y el endpoint puede devolver `null`/`0` para materiales sin stock actual (§5, nota). Si el precio fuera read-only, esos materiales serían unusable. |
| 8 | El **total de CIF es editable en cliente y no se persiste**. | `DummyProductCost` no tiene campo para un override de CIF y la spec upstream lo sigue derivando de los períodos. Al guardar, el backend recalcula el CIF real. |
| 9 | El camino del **producto normal queda intacto**. | Se sigue usando `getCostEstimateAction` + `applyMaterialQuantityChange`. Los endpoints dummy son un flujo paralelo, no un reemplazo. |
| 10 | En modo dummy se oculta el **listado agregado**, y el historial de snapshots propio se muestra. | La spec upstream excluye el dummy de `GET /api/costs/products/latest` (§4.4) pero deja `GET /api/costs/{id}/snapshots` funcionando. |

## Dependencias de backend

Detalle en [`spec-funtional.md`](./spec-funtional.md). Lo que este repo necesita:

| Dep | Qué | Endpoint | Estado |
|---|---|---|---|
| B1 | Flag `isTestProduct` + query param `includeTestProducts` | `GET /api/products/list?includeTestProducts=true` | Spec upstream §1 |
| B2 | `unitGramsFinalProductUsed` en el response | `POST /api/costs/dummy-product/estimate` | Spec upstream §3 |
| B3 | Precios de referencia por material | `GET /api/costs/feedstock/list` → `{ id, name, pricePerGram }`<br/>`GET /api/costs/packaging/list` → `{ id, name, pricePerUnit }` | ✅ **Resuelto** — spec upstream §5 |
| B4 | Regla del piso de 100g | todos los endpoints dummy | Spec upstream §3 |
| B5 | Snapshot, guardado y edición | `POST /api/costs/dummy-product/save`<br/>`PUT /api/costs/dummy-product/snapshot/{id}` | Spec upstream §4.3 |

**Dos detalles de integración que hay que respetar:**

- El dummy se crea con `active=false` (§2). Si el selector lo pide con filtro `active=true`, **no va a aparecer**. Hay que llamar sin ese filtro, o con `false`.
- B3 devuelve **solo materiales activos** (`getAll(true, ...)`), y `pricePerGram` / `pricePerUnit` pueden venir `null` o `0` para materiales sin stock actual.

## Diseño

### Detección del modo

```ts
// hooks/product/useGetProductList.ts — parametrizado, con queryKey por params
export const getProductList = async (params?: { includeTestProducts?: boolean }) => { ... };

useQuery({
  queryKey: ["productList", params],   // la clave incluye los params
  queryFn: () => getProductList(params)
});

// hooks/costs/useEstimate.ts — único lugar que pide el dummy
const { productList } = useGetProductList({ includeTestProducts: true });
```

Que el `queryKey` incluya los params es lo que evita la contaminación de caché: las otras 12 llamadas siguen pidiendo `["productList", undefined]` y nunca ven el dummy.

```ts
const isTestProduct = Boolean(selectedProduct?.isTestProduct);
```

`ProductOption` (`src/hooks/costs/useEstimate.ts:24`) crece con `isTestProduct?: boolean`.

### Bifurcación del flujo

```ts
handleProductChange = product => {
  setCifOverride(null);      // ver §El override de CIF
  methods.reset();
  setEstimate(null);
  setError(null);
  if (!product?.id) return;

  if (product.isTestProduct) {
    setEstimate(createEmptySimulation(product, config));  // estimate vacío local, sin request
  } else {
    handleEstimate(product.id);                            // camino actual, sin cambios
  }
};
```

En modo dummy **no** se llama a `getCostEstimateAction`. Se construye un objeto de presentación local con los totales en `0` y las listas vacías, para que la UI pueda renderizar el summary y las tablas vacías con su botón de agregar.

### Agregar filas

Se replica el patrón de `CifItemsTable.tsx` / `CifItemRow.tsx` (ya existe dentro del módulo de costos): `localId` como identidad de cliente, `TextField select`, botón "Agregar" con `mdi:plus`, borrado por fila.

| Columna | Origen | Editable |
|---|---|---|
| Material | select (B3) | — |
| **Precio** | `pricePerGram` / `pricePerUnit` del material elegido | **Sí** — decisión 7 |
| Cantidad | usuario (gramos para feedstock, unidades para empaque) | Sí |
| — | acción de borrar | — |

Al elegir un material, la fila se prellena con el precio de B3. Si viene `null` o `0`, el campo queda vacío y el usuario lo tipea — sin precio no se puede enviar la fila.

| Archivo | Cambio |
|---|---|
| `estimate/MaterialRow.tsx` _(nuevo)_ | Espejo de `CifItemRow`: select de material, precio, cantidad, borrar. Keyed por `localId` |
| `estimate/CostBreakdown.tsx` | Render condicional, filas editables, eliminación del `useEffect` |

Las filas nuevas se marcan `isDraft: true` para distinguirlas de las que vengan del backend al reabrir un snapshot.

**Sobre las filas de CIF:** la spec upstream mantiene el CIF derivado de los períodos (`computeCifAverage` / `computeCifTypeAverages`). No hay modo de agregar ítems de CIF a mano. `cifDetails` se renderiza read-only, como hoy, con sus cuatro columnas.

### El estimate en tiempo real

Cada cambio (alta/baja de fila, cambio de material o precio, cambio de cantidad, de unidades o de gramos) dispara la vista previa:

```
POST /api/costs/dummy-product/estimate
  { unitGramsFinalProduct, units, wastePct, commissionPct, finalPrice,
    isDefinitive: false, notes,
    materials: [{ idMaterial, materialType, quantity, unitCost }] }
→ ProductCostAndPriceDTO
```

`persist=false`: el backend devuelve el snapshot calculado sin guardarlo. El frontend reemplaza el estado del estimate con la respuesta y todo el summary se rerenderiza.

`quantity` es **la cantidad base de la receta**: gramos para feedstock, unidades para empaque — lo que las fórmulas de la spec upstream esperan (`baseQuantityG` para feedstock, `quantity` de empaque).

**El empaque no se escala por gramos** (§4.2, paso 5: *"empaque no se diluye con el peso"*). El frontend no tiene que hacer nada especial, pero tampoco debe intentar replicar ese cálculo (ver [Punto abierto 1](#puntos-abiertos)).

### El override de CIF

El único cálculo que queda en el cliente:

```ts
const [cifOverride, setCifOverride] = useState<number | null>(null);
const effectiveCif = cifOverride ?? estimate.totalCif;
```

`estimate.totalCif` nunca se sobreescribe — el valor del backend queda en memoria y resetear es `setCifOverride(null)`. El override **se resetea al cambiar de producto**, junto con el resto del estado del estimate; si no, se filtraría al producto siguiente.

El campo vive en el summary (`CostSummaryCards.tsx`), que hoy ya muestra `estimate.totalCif` en las líneas de detalle de "Costo por Kg" y "Costo por Unidad". Al editarlo se recalcula en cliente `totalCost = realCostMaterialUnit + effectiveCif` y los cards se actualizan.

**Este override no dispara requests.** Es una vista local: al guardar, el backend recalcula el CIF real desde los períodos y el valor editado se pierde — consecuencia directa de la decisión 8.

### El piso de 100g

Si el usuario tipea menos de 100 gramos, el backend **calcula con 100** pero guarda el valor real. El response trae los dos:

- `unitGramsFinalProduct` — el valor tipeado, sin alterar
- `unitGramsFinalProductUsed` — el valor con el piso aplicado (≥100)

Para que el usuario no wonder por qué bajar los gramos no baja el costo, el summary debe mostrar el valor efectivamente usado cuando difiera del tipeado.

### Archivos del repo

| Archivo | Cambio |
|---|---|
| `src/api/costs/actions.ts` | `estimateDummyProduct`, `saveDummyProduct`, `updateDummySnapshot` |
| `src/api/costs/server.ts` | Lectura de precios de referencia (B3) y del snapshot del dummy |
| `src/types/pages/costs.ts` | `unitGramsFinalProductUsed`, `isDraft` en filas locales, DTOs de precio |
| `src/hooks/costs/useEstimate.ts` | `isTestProduct`, `cifOverride`, handlers de filas, bifurcación, debounce |
| `src/hooks/product/useGetProductList.ts` | Parametrizar con `includeTestProducts` + `queryKey` por params |
| `src/hooks/feedstock/*`, `src/hooks/packaging/*` | Hooks nuevos para B3 (`queryKey` propio) |
| `src/views/.../costos/estimate/EstimateForm.tsx` | Inputs de `units` y `unitGramsFinalProduct` |
| `src/views/.../costos/estimate/CostBreakdown.tsx` | Render condicional, filas editables, eliminación del `useEffect` |
| `src/views/.../costos/estimate/MaterialRow.tsx` _(nuevo)_ | Fila con select + precio + cantidad |
| `src/views/.../costos/estimate/CostSummaryCards.tsx` | CIF editable + valor con piso |
| `src/views/.../costos/estimate/index.tsx` | Ocultar listado agregado y precio actual en modo dummy |

`src/utils/costs.ts` **no crece**: `mapMaterialsToPriceInput` y `applyMaterialQuantityChange` se siguen usando solo en el producto normal.

## Verificación

Ver [`QA.md`](./QA.md) para la matriz manual. La verificación numérica es contra la spec upstream (su §Verificación, casos 4–9).

Como el cálculo es del backend, el testing unitario se limita a lo que sí es lógica de cliente:

| Caso | Dónde |
|---|---|
| Armado del payload de `materials` desde las filas locales | `utils/costs` |
| `queryKey` de `includeTestProducts` no colisiona con `["productList"]` | `hooks/product` |
| Reset de `cifOverride` al cambiar de producto | `hooks/costs` |
| Estado limpio al pasar de dummy a producto normal | `hooks/costs` |
| Fila sin precio no se envía al backend | `hooks/costs` |

## Puntos abiertos

1. **La fórmula de empaque del cliente actual parece no coincidir con el backend.** `utils/costs.ts:18` aplica `(baseCost / 100) × unitGramsFinalProduct` **incondicionalmente**, a feedstock y a packaging. La spec upstream (§4.2, paso 5) dice que el empaque **no** se escala por gramos. Si es así, la optimización optimista que dispara `CostBreakdown.tsx:118-129` en cada render muestra hoy un número distinto al del backend para el empaque. Como los endpoints dummy traen los valores del response sin cálculo local, el impacto queda acotado al modo normal — pero hay que verificarlo contra el código backend antes de tocar esa fórmula.

2. **Estrategia de debounce.** Cada cambio dispara un POST. Sin debounce, teclear una cantidad genera un request por tecla. Falta decidir el delay y si se cancelan requests en vuelo.

3. **El `Precio Sugerido` no refleja el override de CIF.** `suggestedPrice` lo calcula el backend con `computeSuggestedPricing` usando el CIF real, no el editado. Con la decisión 8 el card queda mostrando un precio sugerido que no corresponde al CIF que el usuario está viendo. Hay que decidir: recalcularlo en cliente (implica replicar la fórmula del backend, que no está en la spec), ocultarlo mientras haya override, o marcarlo como no ajustado.

4. **Material duplicado.** No se ha definido si se pueden agregar dos filas del mismo material. La UI no lo impide y el backend no lo rechaza.

5. **Material sin precio.** B3 puede devolver `null`/`0` para materiales sin stock. Además de hacerlo editable (decisión 7), hay que decidir si el material se incluye en el select con el precio vacío, o si se comunica explícitamente que "no hay valor de inventario registrado" — porque el usuario podría interpretarlo como un costo de cero.

6. **Qué pasa al recargar la página.** El estimate en modo dummy vive solo en memoria (`persist=false`). Perderlo al recargar es esperable, pero conviene que el usuario lo entienda: las filas no sobreviven. El historial de snapshots sí, vía `GET /api/costs/{dummyId}/snapshots`.