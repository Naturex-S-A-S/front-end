# QA — Producto dummy para simulación de costos (frontend)

Matriz de verificación manual de la adaptación frontend. El contrato y los cálculos son del backend — ver [`spec-funtional.md`](./spec-funtional.md) §Verificación para las pruebas numéricas de ese lado.

**Notas previas:**
- 🔵 = depende de algo de la spec upstream todavía no desplegado (B1–B4 de [`spec.md`](./spec.md)). Sin backend, lo verificable es la UI: inputs visibles, filas agregables, llamadas disparadas.
- **La verificación más importante es la sección 1**: el modo dummy agrega campos y flujo, pero **no debe alterar el producto normal**.
- Cada cambio de material o cantidad pega un POST a `/api/costs/dummy-product/estimate`. Vigilar la pestaña Network en toda la sección 3.

---

## 1. Producto normal — no debe cambiar nada

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 1.1 | Estimate normal 🔵 | Seleccionar un producto real (con materiales) | Se llama `getCostEstimateAction`; las tablas se llenan solas |
| 1.2 | Paridad de números | Comparar el summary con lo que mostraba antes | **Idéntico.** Si difiere, revisar el punto abierto 1 de la spec |
| 1.3 | Editar cantidades | Cambiar la cantidad base de un material | Se recalcula la fila, los totales y el summary — como antes |
| 1.4 | No aparece el dummy 🔵 | Abrir el selector de productos del módulo de costos | El dummy **sí** aparece (este es el único lugar donde debe) |
| 1.5 | El dummy no se filtra 🔵 | Abrir kardex, formulación, empaque, aprovisionamiento | El dummy **no** aparece en ninguno de los selectores de producto |
| 1.6 | Filtro de `active` 🔵 | Inspeccionar la request del listado | Sin `active=true`; si se manda `false`, el dummy (`active=false`) igual aparece |
| 1.7 | Caché no contaminada | Alternar entre costos y formulación varias veces | El dummy no reaparece en formulación; `queryKey` distinto por params |
| 1.8 | Listados de otros módulos | Cambiar a inventario / producción | Nadie más pide `includeTestProducts` |

## 2. Selección del producto dummy

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 2.1 | Detección 🔵 | Seleccionar "Producto de pruebas Naturex" | Entra en modo simulación |
| 2.2 | **Sin request de estimate** | Pestaña Network | **No** se llama `getCostEstimateAction` |
| 2.3 | Campos nuevos | Ver el form | Aparecen los inputs **Unidades** y **Gramos por unidad**, ambos vacíos y obligatorios |
| 2.4 | Tablas vacías visibles | Ver la pantalla | Materia prima, empaque y CIF se ven vacías, con botón "Agregar" |
| 2.5 | Summary en cero | Ver el summary | Montos en `0`, sin `NaN` ni `undefined` |
| 2.6 | Validación | Enviar con unidades o gramos vacíos | No dispara el estimate; muestra el error |
| 2.7 | Validación de positivos | Gramos = `0` o `-5` | Rechaza (el DTO es `@Positive`) |
| 2.8 | Volver a un producto real | Dummy → producto real | Se llama el estimate normal y el estado queda limpio, sin filas del dummy |
| 2.9 | Snapshot detalle | Abrir el detalle de un snapshot | Sigue funcionando read-only, con las 4 columnas de CIF |

## 3. Simulación en tiempo real

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 3.1 | Agregar feedstock | "Agregar" en Materia Prima → elegir un material | Fila con el material, `Precio` prellenado con `pricePerGram` de `/api/costs/feedstock/list` 🔵, cantidad vacía |
| 3.2 | Agregar packaging | "Agregar" en Material de Empaque → elegir un material | `Precio` prellenado con `pricePerUnit` de `/api/costs/packaging/list` 🔵 (**no** por gramo) |
| 3.3 | Precio editable | Cambiar el precio de una fila | Acepta el cambio; el estimate usa el valor tipeado, no el del endpoint |
| 3.4 | Material sin precio 🔵 | Elegir un material sin stock | El precio queda vacío; el usuario lo tipea. Sin precio, la fila no se envía (ver 3.5) |
| 3.5 | Fila incompleta no se manda | Dejar el precio vacío y cambiar la cantidad | No se dispara POST, o el backend responde 400 — el comportamiento debe ser explícito, no un `null` silencioso |
| 3.6 | Agregar dispara estimate | Network al agregar una fila | Un POST a `/api/costs/dummy-product/estimate` con esa fila en `materials` |
| 3.7 | Cambiar cantidad | Cargar `Cantidad base (g)` = 100 | POST; el summary se actualiza con la respuesta del backend |
| 3.8 | Cargar unidades y gramos | Completar los dos inputs | POST; el summary refleja el escalado |
| 3.9 | Cambiar el material | Cambiar el select de una fila | POST con el nuevo `idMaterial` y su precio |
| 3.10 | Borrar fila | Botón de basura | POST sin esa fila; los totales se actualizan |
| 3.11 | Borrar todas | Borrar todas las filas de una tabla | La tabla **sigue visible** con su botón "Agregar" |
| 3.12 | Debounce 🔵 | Teclear `150` en la cantidad | **Un** request, no tres. Verificar el delay acordado (punto abierto 2) |
| 3.13 | Requests en vuelo | Cambiar rápido dos cantidades | No quedan respuestas de requests viejos pisando el estado (punto abierto 2) |
| 3.14 | Sin materiales | Borra todo y no cargues unidades | El summary sigue en `0`, sin `NaN` |
| 3.15 | Solo activos 🔵 | Abrir el select de material | No aparecen materiales inactivos |

## 4. Piso de 100g

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 4.1 | Gramos ≥ 100 | Gramos = 150 | Se calcula con 150. `unitGramsFinalProduct` = `unitGramsFinalProductUsed` = 150 |
| 4.2 | Gramos < 100 | Gramos = 50 | El summary indica que el cálculo usó **100**, no 50. `unitGramsFinalProduct` guarda 50 |
| 4.3 | Visibilidad del piso | Con gramos = 50 | El usuario ve por qué el costo no baja de 100g — no es un número mágico |
| 4.4 | No es acumulable | Con gramos = 50, subir a 120 | Se recalcula con 120; el piso deja de aplicar |
| 4.5 | Field en el snapshot 🔵 | Guardar y reabrir el snapshot | Trae `unitGramsFinalProductUsed` con el valor con piso |

## 5. CIF total editable

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 5.1 | Campo editable | Ver el summary en modo dummy | El total de CIF es editable; se inicializa con el valor del backend |
| 5.2 | Recálculo | Editar el CIF | `Costo por Kg` y `Costo por Unidad` se actualizan |
| 5.3 | Sin request | Editar el CIF, observar Network | **No** dispara POST (es vista local) |
| 5.4 | Reset | Editar el CIF, usar la acción de reset | Vuelve al valor del backend |
| 5.5 | Reset al cambiar de producto 🔵 | Editar el CIF, cambiar de producto, volver al dummy | El campo arranca con el valor del nuevo estimate, no con el editado |
| 5.6 | **No se persiste** | Editar el CIF, guardar, reabrir el snapshot | Vuelve el CIF real derivado de los períodos — el override se perdió |
| 5.7 | Precio sugerido | Con CIF editado | Ver punto abierto 3: el card debe ser coherente con la decisión que se tome |

## 6. Guardado

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 6.1 | Guardar | Registrar precio en modo dummy | `POST /api/costs/dummy-product/save`; toast de éxito |
| 6.2 | Historial propio | Ver el historial de snapshots del dummy | Muestra sus simulaciones 🔵 |
| 6.3 | Listado agregado | Ver el listado agregado de costos | El dummy **no** aparece 🔵 |
| 6.4 | Editar snapshot | Editar uno guardado y guardar de nuevo | `PUT /api/costs/dummy-product/snapshot/{id}` |
| 6.5 | Definitivo | Guardar con `isDefinitive=true`, intentar editar | Bloquea con el mismo 409 del flujo real 🔵 |
| 6.6 | Payload | Inspeccionar el request de guardado | `materials` incluye las filas locales con `idMaterial`, `materialType`, `quantity`, `unitCost` |

## 7. Regresión técnica

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 7.1 | `useEffect` eliminado | Revisar `CostBreakdown.tsx` | Ya no llama a `onEstimateEdit` en cada render; se puede quitar el `eslint-disable` |
| 7.2 | `utils/costs.ts` | Revisar el archivo | Sin funciones nuevas — solo las dos que ya existían |
| 7.3 | Aislamiento del query param | Buscar `includeTestProducts` | Aparece solo en el módulo de costos |
| 7.4 | `queryKey` por params | Inspeccionar el queryKey del listado | `["productList", { includeTestProducts: true }]` en costos; `["productList", undefined]` en el resto |
| 7.5 | Consola / red | Recorrer las secciones 2 a 6 | Sin errores 4xx/5xx nuevos; sin warnings de keys o renders en loop |
| 7.6 | Build | `pnpm build` | Compila sin errores de tipos |
| 7.7 | Lint | `pnpm lint` | Sin errores nuevos |