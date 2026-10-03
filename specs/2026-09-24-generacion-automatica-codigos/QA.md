# QA — Verificación de la iteración "Categoria single-select + contrato IDs automáticos"

Matriz de casos de prueba para verificar manualmente la iteración completa del frontend.

**Notas previas:**
- Los casos marcados con 🔵 **requieren backend nuevo** (efecto end-to-end: código auto, `/categories/lot`, generación de lote server-side).
- Sin backend actualizado, lo verificable es el **comportamiento del form y payload** (campos que se muestran, validaciones, lo que se envía).
- Datos de ejemplo usados (estado real del sistema):
  - Categorías producto: `Alimento`, `Organico`
  - Categorías empaque: `Envase`, `Tapa`
  - Categorías materia prima: `Granos`, `Polvos`
  - Productos: `P-001` (Colageno 100g), `P-002` (Colageno 150g)
  - Materias primas: `F-1788841776` Glicina, `F-1788841794` Vitamina c, `F-1788841839` Prolina
  - Empaques: `P-1788495490` (Envase plástico colageno)

---

## 1. Producto — `inventario/producto-terminado`

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 1.1 | Categoría single-select | Abrir crear producto, enfocar campo "Categoría" | Autocomplete de una sola opción (ej. "Alimento" u "Organico") — NO multi-select |
| 1.2 | Sin código manual 🔵 | Revisar el form de producto | No existe el campo de código manual; el id lo genera el backend |
| 1.3 | `lotCategory` requerida | Dejar "Categoría de lote" vacía + enviar | Bloquea: error "Seleccione una categoría" |
| 1.4 | `category` requerida | Dejar "Categoría" vacía + enviar | Bloquea con error de selección |
| 1.5 | Creación exitosa 🔵 | Nombre: `Colageno`, medida: `100`, unidad: `g`, categoría: `Alimento`, lotCategory: (crear antes una categoría de lote) | Crea con toast; al recargar el id lo asignó el backend |
| 1.6 | Edición | Editar `P-001` | Categoría preseleccionada; guarda sin pedir código |

---

## 2. Material de empaque — `inventario/material-empaque`

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 2.1 | Categoría single-select | Crear empaque, campo "Categoría": `Envase` | Una sola opción desplegable |
| 2.2 | `productCode` ON | dependencia = **Sí** → el campo "Código de producto" aparece | Aparece y es obligatorio |
| 2.3 | `productCode` OFF | dependencia = **No** | El campo no aparece / no se envía `productCode` |
| 2.4 | Guardado con dependencia | `Envase plástico colageno`, depende = Sí, `productCode` = `P-001` | Persiste el `productCode` |
| 2.5 | Sin id manual | Revisar form de empaque | No pide id manual |

---

## 3. Materia prima — `inventario/materia-prima`

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 3.1 | Categoría opcional | Crear materia prima, dejar categoría vacía | Se permite vacío |
| 3.2 | Crear **sin** categoría | `Glicina`, sin categoría → enviar | Crea OK (payload `category: []`) |
| 3.3 | Crear **con** categoría | `Glicina` + categoría `Granos` | Crea con `category: ["b07a2ff9-…"]` |
| 3.4 | Edición | Editar `F-1788841776` | Categoría preseleccionable; guarda OK |

---

## 4. Detalle de inventario — componente Categories

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 4.1 | Agregar reemplaza | Detalle de `P-001`, sección categorías (actual `Alimento`), agregar `Organico` | La lista queda SOLO con `Organico` (reemplaza, no acumula) |
| 4.2 | Eliminar vacía | Borrar la única categoría | Lista vacía (envía `[]`) |
| 4.3 | Persistencia | Recargar el detalle | Refleja el último estado guardado |

---

## 5. Parámetros generales — categorías (`soporte/parametros-generales`)

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 5.1 | Crear PRODUCTO | Nombre `Fermento`, `idIndicator`: `12`, `expirationMonths`: `24` | Pide ambos campos; crea |
| 5.2 | Crear PRODUCTO inválido | `idIndicator`: `1` (1 dígito) | Error: debe tener 2 dígitos |
| 5.3 | Crear EMPAQUE | Nombre `Sachet`, `codeIndicator`: `3`, depende_producto: Sí → `productCode` = `P-001` | Crea con campos condicionales |
| 5.4 | Crear LOTE 🔵 | Nombre `Lote alimenticio`, `lotFormat`: `Alimentos` | Crea; aparece en el listado |
| 5.5 | Crear MP | Nombre `Polvo fino` (solo nombre) | Crea sin campos extra |
| 5.6 | Editar PRODUCTO | Categoría `Alimento` (`bc0c36a7-…`) → `idIndicator` = `12`, exp = `24`, guardar y recargar | **Persisten** los valores (regresión PUT corregida) |
| 5.7 | Editar EMPAQUE | Categoría `Envase` → `codeIndicator` + depende, guardar y recargar | Persisten |
| 5.8 | Editar LOTE 🔵 | `Lote alimenticio` → `lotFormat` = `Cosméticos`, guardar y recargar | Persiste |
| 5.9 | Editar MP | `Granos` → renombrar `Granos tostados` | Guarda solo el nombre, no rompe |
| 5.10 | Eliminar LOTE 🔵 | Borrar `Lote alimenticio` | Desaparece del listado (invalida "getCategoriesLot") |
| 5.11 | Listado | Ver todas las categorías | Mezcla tipos: Producto / Material de empaque / Materia prima / Categoría de lote |

---

## 6. Órdenes de producción — `produccion/ordenes`

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 6.1 | Sin fecha manual | Paso 2 del form de orden | Ya NO aparece el campo "Fecha de vencimiento" |
| 6.2 | Crear sin fecha | Producto `P-001`, qty `100` → Generar | Crea OK, sin `date_expiration` en payload |
| 6.3 | Detalle: etiqueta 🔵 | Abrir detalle de una orden con backend nuevo | Muestra "Etiqueta de vencimiento" (ej. `5 días`), NO "Fecha de vencimiento" |
| 6.4 | Detalle: lotes 🔵 | Orden ya generada con lotes | Sección "Lotes de la orden" con `P-001` + batch |
| 6.5 | Detalle sin lotes | Orden recién creada | No muestra la sección de lotes; no rompe |

---

## 7. Aprovisionamiento — `produccion/aprovisionamiento` (fix)

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 7.1 | Fecha requerida | Enviar sin escoger fecha del picker | Error: "La fecha de expiración es requerida" (antes enviaba `Invalid date`) |
| 7.2 | Crear con fecha | Producto `P-001`, qty `200`, fecha = hoy + 1 día | Crea; envía `date_expiration` en `YYYY-MM-DD` |

---

## 8. Regresión cruzada

| # | Caso | Pasos / datos de ejemplo | Resultado esperado |
|---|------|--------------------------|--------------------|
| 8.1 | Producción sigue sin fecha | Crear orden de producción | Sin campo fecha (no comparte validación con aprovisionamiento) |
| 8.2 | Permisos CASL | Probar como admin y como rol lectura | Guards por módulo siguen ocultando crear/editar según rol |
| 8.3 | Consola / red | Realizar 1 creación y 1 edición por módulo | Network sin errores 4xx/5xx nuevos; consola sin warnings inesperados |