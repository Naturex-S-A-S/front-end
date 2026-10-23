# Especificación de reportes — Inventario Naturex

> Versión 4 · 19 oct 2026 (v3: 16 oct 2026 · v2: 15 oct 2026 · v1: 12 oct 2026)
> Base: análisis de viabilidad ([`reportes-viabilidad.html`](reportes-viabilidad.html)) y versión cliente ([`reportes-alcance-cliente.html`](reportes-alcance-cliente.html)).
> Plan de implementación: [`reports-execution-plan.md`](reports-execution-plan.md).
>
> **Cambios en v4:** se retiran del alcance R-1.4 (capacidad de planta / OEE) y R-3.3 (tiempos de limpieza y despeje): no hay información para construirlos. La entrega pasa de dos rondas a **tres etapas** (§1.1); la Etapa 1 cubre R-1.1, R-1.2, R-1.3, R-1.5 y R-2.1.
>
> **Cambios en v3:** la entrega se divide en dos rondas. Solo los informes viables en la primera; los parciales y los cambios que dependen de decisiones, después. Nuevas decisiones D-9 a D-11.
>
> **Cambios en v2:** permisos sobre el módulo existente *Finanzas y administración › Informes* (RG-14); requisitos de pantalla del front (§10); cambios a funcionalidades existentes de back y front (§11); decisiones D-7 y D-8.

Este documento define **qué** debe entregar cada reporte y **cómo se valida**: definiciones de negocio, reglas generales, catálogo de filtros, métricas, requisitos de pantalla y criterios de aceptación. El **cómo** (endpoints, clases, componentes, migraciones y fases) está en el plan de ejecución.

---

## 1. Alcance

| ID | Reporte | Estado de datos | Etapa |
|---|---|---|---|
| R-1.1 | Kg / Ton producidas por línea y forma (+ kg de materia prima consumida) | Viable | **1** |
| R-1.2 | Comparativo de volumen contra el año anterior | Viable | **1** |
| R-1.3 | Balance de masa y rendimiento por orden | Viable | **1** |
| R-1.5 | Costo por kg / ton producido | Viable | **1** |
| R-2.1 | Top de productos más vendidos | Viable | **1** |
| R-2.2 | Más rentables vs menos rentables | Viable | 2 |
| R-2.3 | Utilidad absoluta + Pareto | Viable | 2 |
| R-2.4 | Matriz volumen vs margen | Viable | 2 |
| R-2.5 | Meta anual de ventas | Parcial: falta registrar la meta | 3 (D-2, D-3, D-4) |
| R-3.1 | Costo estándar vs real con semáforo | Parcial: sin mano de obra por orden | 3 (D-9) |
| R-3.2 | Mermas por lote (granel, materia prima, empaque) | Viable | 2 |
| R-4.1 | Rentabilidad por cliente / maquila | No viable | Fuera (ver §8) |
| R-4.2 | Vencimientos y rotación FEFO | Parcial: saldo estimado de producto terminado | 3 (D-10) |
| R-4.3 | Días de cartera (DSO) | No viable | Fuera (ver §8) |
| R-G1 | Tablero directivo (tarjetas KPI) | Viable | 2 con 4 tarjetas; la de meta en 3 |
| R-G2 | Exportación XLSX / CSV | Viable | **1** para sus informes; cada etapa agrega los suyos |
| R-G3 | Exportación PDF (por reporte y consolidado) | Parcial | 3 (D-11) |

### 1.1 Etapas de entrega

- **Etapa 1 (esta iteración): volumen, costo por kg y top de ventas.** R-1.1, R-1.2, R-1.3, R-1.5 y R-2.1, con su exportación XLSX / CSV (R-G2). Incluye los cambios M-3, M-4 (solo *Informes*), M-7 y M-8. Ningún informe de esta etapa espera una decisión: D-1 (IVA) y D-6 (CIF) se trabajan con el supuesto de §9 y se informan con advertencias.
- **Etapa 2: rentabilidad, mermas y tablero.** R-2.2, R-2.3, R-2.4, R-3.2 y el tablero R-G1 con 4 tarjetas, con su exportación. Todos son viables; se separan porque comparten el costeo de cada línea de venta, que se construye y se valida en esta etapa sobre la base ya probada de la Etapa 1.
- **Etapa 3: pendiente por decisiones.** R-2.5 meta anual (y su tarjeta en R-G1), R-3.1 estándar vs real, R-4.2 vencimientos, R-G3 PDF y los cambios M-1, M-4 (*Metas de venta*), M-5 y M-6. Cada uno indica en §9 qué decisión lo bloquea.
- **Fuera de las tres etapas:** R-4.1 y R-4.3 (§8).

Las especificaciones de las Etapas 2 y 3 se dejan en este documento, marcadas *(Etapa 2)* o *(Etapa 3)*, para que el diseño de la Etapa 1 no les cierre el paso. No se implementan ni se prueban en esta iteración.

---

## 2. Definiciones de negocio

| Término | Definición | Origen del dato |
|---|---|---|
| **Línea de negocio** | Categoría de lote del producto terminado. | `final_product.lot_category_id` → `lot_categories` |
| **Línea de materia prima y empaque** | Se hereda del producto de la orden de producción donde se consumió. Si la orden tiene productos de varias líneas, se reparte según los kg planeados de cada ítem. | `*_kardex.id_order` → `items` → `final_product.lot_category_id` |
| **Forma** | Categoría propia de lo que se mide. | Producto terminado: `product_categories`. Materia prima: `feedstock_categories`. Empaque: `packaging_categories` |
| **Kg producidos** | Suma de las entradas de producto terminado asociadas a órdenes de producción no canceladas, incluidos los ajustes de entrada de la orden. | `kardex_final_product.quantity_kg`, `type='input'` |
| **Kg de una unidad** | `measurement` si la unidad es kg o L; `measurement / 1000` si es g o ml. | `final_product.measurement`, `unit` |
| **Fecha de venta** | **Fecha de carga del archivo.** Los archivos no traen fecha de venta. Si se aprueba M-1 (§11), es la fecha que el usuario elige al cargar. | `sales_order.file_date` |
| **Venta neta** | Siigo: `charge / (1 + ivaPct/100)`. Remisión: `quantity × final_price` vigente en la fecha de venta. | `sales_order_detail`, `product_price` |
| **Costo de materiales por unidad** | Costo real de materia prima + empaque por kg del último cierre de orden que incluyó el producto antes de la venta × kg de la unidad. Si no hay cierre, se usa el snapshot vinculado al precio vigente. | `product_cost_snapshot` (`order_close`), `product_price.id_snapshot` |
| **CIF por unidad** | Costos indirectos (mano de obra, administración, servicios, distribución, depreciación) por kg × kg de la unidad. Misma fuente que el costo de materiales. | `cost_cif_kg`, `cost_cif_unit` |
| **Margen bruto %** | `(venta neta − materiales) / venta neta × 100` | — |
| **Margen neto %** | `(venta neta − materiales − CIF − comisión) / venta neta × 100` | `product_price.commission_pct` |
| **Utilidad neta** | `venta neta − materiales − CIF − comisión` (COP) | — |
| **Producto de prueba** | Producto marcado como dummy. Nunca entra en reportes. | `final_product.is_test_product = true` |

---

## 3. Reglas generales (aplican a todos los reportes)

| ID | Regla |
|---|---|
| **RG-01 Filtro de fecha obligatorio** | Todo reporte recibe `from` y `to` (ISO `yyyy-MM-dd`, ambos inclusivos). Si falta alguno o `from > to` → **400**. El front envía por defecto el mes en curso. Las excepciones de significado están documentadas en cada reporte: R-2.5 usa año + fecha de corte; R-4.2 usa rango de **vencimiento**. |
| **RG-02 Rango máximo** | Máximo **731 días** entre `from` y `to`; más → **400**. R-1.2 compara contra el mismo rango del año anterior, así que consulta hasta 2 × 731 días. |
| **RG-03 Campo de fecha por reporte** | Cada reporte declara sobre qué fecha filtra: ingreso a kardex, cierre de orden, fecha de carga, fecha de snapshot o vencimiento. El campo se informa en la respuesta (`meta.dateField`). |
| **RG-04 Zona horaria** | `America/Bogota`. Para los campos `timestamp`, `to` se aplica como `< to + 1 día`. |
| **RG-05 Productos de prueba** | Siempre se excluyen. No es un filtro opcional: no se expone en la API. |
| **RG-06 Órdenes canceladas** | Se excluyen siempre en producción y costeo. Las métricas de cierre (R-1.3, R-1.5, R-3.x) solo usan órdenes `finalizada`. |
| **RG-07 Filtros multivalor** | `productIds`, `lotCategoryIds`, `categoryIds`, `providerIds`, `warehouseIds` y `cifTypeIds` aceptan varios valores, combinados con OR dentro del filtro y AND entre filtros. Si el filtro se omite, se incluyen todos. |
| **RG-08 Sin categoría** | Los registros sin línea o sin forma se agrupan como `"Sin línea"` / `"Sin forma"` con `id = null`. El valor especial `none` en `lotCategoryIds` o `categoryIds` filtra precisamente esos registros. |
| **RG-09 Unidades y redondeo** | Kg con 3 decimales. Toneladas con 3. COP con 0. Porcentajes con 2. La API devuelve números, nunca texto formateado. |
| **RG-10 Moneda** | La moneda es siempre **pesos colombianos (COP)**. El sistema no maneja otras monedas ni conversión: no existe filtro, parámetro ni selector de moneda, y la respuesta no incluye un campo de moneda. Todo valor monetario se muestra con `$` (UI-23). Las ventas en $ son **venta neta** (§2). |
| **RG-11 Resultado vacío** | Devuelve **200** con `data: []` y totales en 0. Nunca 404 por falta de datos. |
| **RG-12 Advertencias** | Cada respuesta incluye `warnings[]` con código y mensaje cuando aplica (ver §3.1). El front las muestra encima del gráfico. |
| **RG-13 Metadatos** | Cada respuesta incluye `meta`: filtros efectivos (con los valores por defecto aplicados), `dateField` y `generatedAt`. |
| **RG-14 Permisos** | Todos los endpoints exigen token válido. Consultar y exportar exigen **leer** el submódulo existente *Finanzas y administración › Informes* (path `/finanzas-y-administracion/informes`). Crear, editar y eliminar metas exigen **crear / actualizar / eliminar** sobre el submódulo nuevo *Finanzas y administración › Metas de venta* (path `/finanzas-y-administracion/informes/metas`). El chequeo del backend compara el path exacto, así que cada path debe existir como fila en los módulos. El menú y las acciones visibles del front salen de los mismos permisos (§10.1). |
| **RG-15 Rendimiento** | Con 12 meses de datos de producción, cada endpoint responde en menos de **3 s** (p95). La exportación responde en menos de **10 s**. |
| **RG-16 Solo lectura** | Los reportes no modifican datos ni recalculan costos. Leen snapshots y kardex tal como están. Las fórmulas de costeo no cambian (ver skill `costs-module`). |
| **RG-17 Cliente** | El filtro **cliente** pedido en los requerimientos **no se implementa** en esta entrega: no existe la entidad cliente. El parámetro no se expone. Ver §8. |
| **RG-18 Exportación** | Todo reporte tabular se puede exportar con **los mismos filtros** que la consulta en pantalla (§7). |

### 3.1 Catálogo de advertencias

| Código | Cuándo se emite | Mensaje para el usuario |
|---|---|---|
| `SALE_DATE_IS_UPLOAD_DATE` | Cualquier reporte de ventas (R-2.x, tarjetas de ventas de R-G1) con al menos una orden del rango cargada sin fecha de venta (ver M-1, §11). | "La fecha de venta corresponde a la fecha de carga del archivo. Si el archivo se subió tarde, las ventas pueden aparecer en otro período." |
| `REMISSIONS_VALUED_AT_LIST_PRICE` | Hay líneas de remisión en el resultado. Incluye cuántas. | "N líneas de remisión se valorizaron con el precio de venta vigente." |
| `REMISSIONS_WITHOUT_PRICE` | Una remisión no tiene precio vigente: su venta queda en 0. | "N líneas de remisión no tienen precio vigente y suman $0." |
| `CIF_INCOMPLETE` | Algún snapshot usado tiene `cif_incomplete = true`. | "Los costos indirectos están incompletos: falta cerrar períodos CIF con kg producidos." |
| `MATERIAL_COST_INCOMPLETE` | Algún snapshot usado tiene `material_incomplete = true`. | "Algún insumo no tenía costo al cerrar la orden." |
| `SALES_WITHOUT_COST` *(Etapa 2)* | Líneas vendidas sin cierre de orden ni snapshot de precio. | "N productos vendidos no tienen costo registrado; su utilidad aparece sobrestimada." |
| `ESTIMATED_LOT_BALANCE` *(Etapa 3)* | R-4.2 con producto terminado. | "El saldo por lote de producto terminado es estimado (se asume que sale primero lo más antiguo)." |
| `UNCATEGORIZED_DATA` | Hay filas en "Sin línea" o "Sin forma". | "Hay registros sin línea de negocio o forma asignada." |
| `NO_PREVIOUS_YEAR_DATA` | R-1.2 sin datos en el período de comparación. | "No hay datos del año anterior para comparar." |
| `MULTI_PRODUCT_ORDER_COST` | R-1.5 (o R-3.1 en la Etapa 3) incluye órdenes con más de un producto. | "En órdenes con varios productos el costo corresponde a la orden completa." |

---

## 4. Catálogo de filtros

Columna **Origen**: **REQ** = pedido en los requerimientos iniciales (fecha, cliente, producto, lote, línea). **DEF** = agregado por las definiciones de línea y forma. **REC** = recomendado en el análisis.

| Parámetro | Tipo | Descripción | Origen |
|---|---|---|---|
| `from`, `to` | date | Rango de fechas (obligatorio, RG-01). | REQ |
| `granularity` | `day \| week \| month \| year` | Agrupación temporal. Por defecto `month`. | REC |
| `productIds` | string[] | Productos terminados. | REQ |
| `batch` | string | Lote de la orden de producción o del kardex. Coincidencia parcial sin distinguir mayúsculas. | REQ |
| `lotCategoryIds` | string[] | Línea de negocio. Acepta `none`. | REQ |
| `categoryIds` | string[] | Forma. El catálogo depende de `subject` (producto, materia prima o empaque). Acepta `none`. | DEF |
| `subject` | `product \| feedstock \| packaging` | Qué se mide. Determina el catálogo de forma y la unidad. | DEF |
| `groupBy` | `line \| category \| product` | Serie del gráfico apilado. | REC |
| `unit` | `kg \| ton \| units` | Unidad de volumen. | REC |
| `origin` | `siigo \| remision` | Origen de la venta. Omitido = ambos. | REC |
| `formulationId`, `versionId` | int | Fórmula o versión usada por la orden. | REC |
| `materialType` | `materia_prima \| packaging` | Tipo de material en mermas y costeo. | REC |
| `providerIds` | int[] | Proveedor del insumo. | REC |
| `warehouseIds`, `rackIds` | int[] | Bodega o rack (vencimientos). *(Etapa 3)* | REC |
| `cifTypeIds` | int[] | Tipo de CIF (costo por kg). | REC |
| `ivaPct` | decimal | IVA incluido en el Total de Siigo, para calcular la venta neta. Por defecto 0 hasta que el negocio lo confirme (§9). | REC |
| `metric` | `cop \| kg \| units` | Métrica del ranking (o de la meta en la Etapa 3). | REC |
| `sort` | `desc \| asc` | Orden del ranking (más / menos rentables). | REC |
| `top` | int 1–100 | Cantidad de filas del ranking. Por defecto 10. | REC |
| `thresholdPct` | decimal | Umbral del semáforo (R-3.1). Por defecto 5. *(Etapa 3)* | REC |
| `clientIds` | — | **No disponible** (RG-17). | REQ |

### 4.1 Matriz de filtros por reporte

✔ = obligatorio · ● = soportado · ○ = no aplica o no disponible

| Reporte | Fecha | Cliente | Producto | Lote | Línea | Forma | Recomendados adicionales |
|---|---|---|---|---|---|---|---|
| R-1.1 | ✔ ingreso | ○ | ● | ● | ● | ● product / feedstock | `granularity`, `groupBy`, `unit`, `subject`, `formulationId`, `providerIds` (solo feedstock) |
| R-1.2 | ✔ ingreso | ○ | ● | ○ | ● | ● product | `granularity` (month/week), `unit` |
| R-1.3 | ✔ cierre | ○ | ● | ● | ● | ● product | `formulationId`, `versionId`, `minLossPct` |
| R-1.5 | ✔ snapshot | ○ | ● (principal) | ● | ● | ● product | `granularity`, `unit`, `cifTypeIds` |
| R-2.1 | ✔ carga | ○ | ● | ○ | ● | ● product | `origin`, `metric`, `top`, `ivaPct` |
| R-2.2 *(Etapa 2)* | ✔ carga | ○ | ● | ○ | ● | ● product | `origin`, `sort`, `top`, `ivaPct`, `marginType` |
| R-2.3 *(Etapa 2)* | ✔ carga | ○ | ● | ○ | ● | ● product | `origin`, `ivaPct`, `top` |
| R-2.4 *(Etapa 2)* | ✔ carga | ○ | ● | ○ | ● | ● product | `origin`, `ivaPct`, `xAxis` (kg/cop), `cut` (median/target) |
| R-2.5 *(Etapa 3)* | ✔ año + corte | ○ | ● (alcance de la meta) | ○ | ● (alcance de la meta) | ○ | `metric`, `ivaPct`, `origin` |
| R-3.1 *(Etapa 3)* | ✔ cierre | ○ | ● | ● | ● | ● product | `thresholdPct`, `status` (green/yellow/red), `materialType` en el detalle |
| R-3.2 *(Etapa 2)* | ✔ cierre / movimiento | ○ | ● | ● | ● (vía orden) | ● según material | `materialType`, `providerIds`, `includeOutsideOrders` |
| R-4.2 *(Etapa 3)* | ✔ vencimiento | ○ | ● | ● | ● (solo producto terminado) | ● product / feedstock | `subject`, `warehouseIds`, `rackIds`, `onlyWithBalance` |
| R-G1 *(Etapa 2)* | ✔ (por defecto, mes en curso) | ○ | ○ | ○ | ● | ○ | `ivaPct` |

---

## 5. Especificación por reporte

Cada reporte lista: objetivo, gráfico, fuente y fecha, datos que devuelve, filtros y criterios de aceptación (**CA**). Los criterios RG-xx aplican siempre y no se repiten.

### R-1.1 Kg / Ton producidas

- **Objetivo:** volumen elaborado por período, línea y forma.
- **Gráfico:** barras apiladas por período. La serie la define `groupBy` (línea o forma). Alterna kg/ton.
- **Fuente / fecha:** `kardex_final_product` (`type='input'`, con orden de producción no cancelada) / `date_created`.
- **Variante `subject=feedstock`:** kg de materia prima consumida por la orden: salidas menos devoluciones con `id_order`. La forma sale de `feedstock_categories` y la línea se hereda de la orden, con reparto.
- **Datos:** `period`, `lineId`, `lineName`, `categoryId`, `categoryName`, `kg`, `ton`, `orders` (órdenes distintas). Totales: `kg`, `ton`, `orders`.
- **Filtros:** ver matriz.
- **CA:**
  1. La suma de `kg` de un mes es igual a la suma de `quantity_kg` de las entradas de kardex de órdenes de producción no canceladas de ese mes, sin productos de prueba.
  2. `ton = kg / 1000` en cada fila.
  3. Los ajustes de entrada con `id_order` suman, igual que en el cierre de la orden.
  4. Con `groupBy=line`, la suma de todas las series de un período es igual a la de `groupBy=category`.
  5. Con `subject=feedstock`, una orden con dos productos de líneas distintas reparte los kg de materia prima según los kg planeados de cada ítem, y la suma de las partes es igual al consumo total de la orden.
  6. `orders` cuenta órdenes distintas, no movimientos.
  7. Los períodos sin producción no se rellenan con 0; el front los muestra vacíos.

### R-1.2 Comparativo contra el año anterior

- **Objetivo:** comparar el volumen del rango contra el mismo rango del año anterior.
- **Gráfico:** dos líneas (año actual y año anterior) por mes o semana, con acumulado.
- **Fuente / fecha:** igual que R-1.1. El rango de comparación es `[from − 1 año, to − 1 año]`.
- **Datos por período:** `periodLabel` (mes `"01"`–`"12"` o semana ISO `"W01"`–`"W53"`, para alinear los dos años), `current`, `previous`, `currentCumulative`, `previousCumulative`, `variationPct`. Totales: `current`, `previous`, `variationPct`.
- **CA:**
  1. `variationPct = (current / previous − 1) × 100`. Si `previous = 0` → `null`, nunca infinito ni error.
  2. Los acumulados reinician al inicio del rango, no al inicio del año calendario.
  3. Si el período anterior no tiene datos, se emite `NO_PREVIOUS_YEAR_DATA` y `previous = 0`.
  4. Los filtros de línea, forma y producto se aplican por igual a ambos períodos.

### R-1.3 Balance de masa y rendimiento

- **Objetivo:** teórico vs real vs merma por orden de producción cerrada.
- **Gráfico:** barras agrupadas por lote (kg teóricos, kg envasados, kg de merma). Tabla con rendimiento %.
- **Fuente / fecha:** `orders` (`classification='produccion'`, `status='finalizada'`) y `order_detail` / `date_closed`.
- **Datos:** `orderId`, `batch`, `closedAt`, `products[]`, `lines[]`, `expectedKg`, `producedKg`, `lossKg`, `lossPct`, `yieldPct`, `extraFeedstockKg`. Totales ponderados: `expectedKg`, `producedKg`, `lossKg`, `lossPct = lossKg / expectedKg × 100`.
- **Filtros extra:** `minLossPct` (solo órdenes con merma ≥ valor).
- **CA:**
  1. `lossKg = max(expectedKg − producedKg, 0)`.
  2. `lossPct` coincide con `orders.loss_percentage` dentro de ±0,01.
  3. `yieldPct = 100 − lossPct`.
  4. `extraFeedstockKg = Σ order_detail.quantity_extra / 1000` de materia prima.
  5. La merma total del pie de tabla es ponderada (Σ merma / Σ teórico), no el promedio de porcentajes.
  6. Una orden con varios productos aparece una sola vez, con la lista de productos y líneas.

### R-1.5 Costo por kg / ton producido

- **Objetivo:** evolución del costo real por kg con desglose.
- **Gráfico:** barras apiladas por mes (materia prima, empaque, CIF por tipo) con una línea de total. Alterna COP/kg y COP/ton.
- **Fuente / fecha:** `product_cost_snapshot` (`snapshot_type='order_close'`) y `product_cost_snapshot_cif_detail` / `date_snapshot`.
- **Datos por período:** `period`, `kg`, `feedstockCopKg`, `packagingCopKg`, `cifCopKg`, `cifByType[] {typeId, typeName, copKg}`, `totalCopKg`, `totalCopTon`, `cifIncomplete`, `materialIncomplete`.
- **CA:**
  1. Los promedios se ponderan por kg producidos: `Σ(costo_kg × kg) / Σ kg`. Nunca un promedio simple.
  2. `totalCopKg = feedstockCopKg + packagingCopKg + cifCopKg` dentro de ±1 COP.
  3. `Σ cifByType.copKg = cifCopKg` dentro de ±1 COP; si no coincide, se registra en log (señal de bug según la skill `costs-module`).
  4. Si algún snapshot del período tiene `cif_incomplete`, se emite `CIF_INCOMPLETE` y la bandera queda en `true` en esa fila.
  5. El filtro de producto aplica sobre el producto principal del snapshot. Si el período tiene órdenes multiproducto, se emite `MULTI_PRODUCT_ORDER_COST`.

### R-2.1 Top de productos más vendidos

- **Objetivo:** ranking por unidades, kg o pesos.
- **Gráfico:** barras horizontales coloreadas por línea.
- **Fuente / fecha:** `sales_order` y `sales_order_detail` / `file_date` (fecha de carga).
- **Datos:** `rank`, `productId`, `productName`, `lineName`, `categoryName`, `units`, `kg`, `netSales`, `valuedRemissionLines`. Totales del período (no solo del top): `units`, `kg`, `netSales`.
- **CA:**
  1. Emite `SALE_DATE_IS_UPLOAD_DATE` según §3.1.
  2. `metric` define el orden; los empates comparten posición (`RANK`).
  3. `kg = units × kg de la unidad` (§2).
  4. La venta de una remisión es `quantity × final_price` vigente en `file_date`. Si no hay precio → 0 y se emite `REMISSIONS_WITHOUT_PRICE`.
  5. `netSales` de Siigo descuenta `ivaPct`.
  6. `top` limita las filas, pero los totales cubren todo el período filtrado.

### R-2.2 Más rentables vs menos rentables — Etapa 2

- **Objetivo:** margen bruto y neto por producto.
- **Gráfico:** barras horizontales del margen elegido (`marginType=gross|net`, por defecto `net`), coloreadas: rojo ≤ 0 %, amarillo < 15 %, verde ≥ 15 %.
- **Fuente / fecha:** base de venta costeada (§2) / `file_date`.
- **Datos:** `productId`, `productName`, `lineName`, `categoryName`, `units`, `kg`, `netSales`, `materialCost`, `cifCost`, `commission`, `grossProfit`, `netProfit`, `grossMarginPct`, `netMarginPct`, `linesWithoutCost`.
- **CA:**
  1. Cada línea de venta se costea con el último snapshot `order_close` del producto con fecha ≤ `file_date`. Si no existe, con el snapshot vinculado al precio vigente.
  2. Las fórmulas cumplen exactamente §2. No se suma el `waste_value` del snapshot.
  3. `sort=asc` devuelve primero los de menor margen, incluidos los negativos.
  4. Un producto con `linesWithoutCost > 0` se marca, y se emite `SALES_WITHOUT_COST`.
  5. Se emiten `CIF_INCOMPLETE`, `SALE_DATE_IS_UPLOAD_DATE` y `REMISSIONS_VALUED_AT_LIST_PRICE` cuando apliquen.
  6. Con `netSales = 0`, los márgenes son `null`.

### R-2.3 Utilidad absoluta + Pareto — Etapa 2

- **Objetivo:** aporte en pesos por producto y concentración.
- **Gráfico:** barras de utilidad neta (las negativas en rojo) con la curva de % acumulado en un eje secundario.
- **Fuente:** misma base que R-2.2.
- **Datos:** `productId`, `productName`, `lineName`, `netSales`, `netProfit`, `paretoCumulativePct`. Totales: `netProfit`, y `productsTo80Pct` (cuántos productos explican el 80 %).
- **CA:**
  1. Orden descendente por `netProfit`.
  2. El acumulado del Pareto solo suma utilidades positivas y termina en 100 %.
  3. Los totales coinciden con la suma de R-2.2 con los mismos filtros.

### R-2.4 Matriz volumen vs margen — Etapa 2

- **Objetivo:** clasificar productos en cuadrantes.
- **Gráfico:** burbujas. X = volumen (`xAxis=kg|cop`), Y = margen neto %, tamaño = |utilidad neta|.
- **Datos:** `productId`, `productName`, `lineName`, `x`, `y`, `size`, `quadrant` (`star | fixed_cost_absorber | niche | parasite`). Totales: `xCut`, `yCut`, `products`.
- **Cortes:** `cut=median` (por defecto) usa la mediana de cada eje. `cut=target` usa `final_product.target_margin_pct` o, si no existe, `cost_calc_config.default_margin_pct` para Y, y la mediana para X.
- **CA:**
  1. Cuadrantes: estrella (X ≥ corte, Y ≥ corte), absorbe costo fijo (X ≥, Y <), nicho (X <, Y ≥), parásito (X <, Y <).
  2. Los productos con `netSales = 0` se excluyen de la matriz.
  3. Los valores X e Y coinciden con R-2.1 y R-2.2 con los mismos filtros.

### R-2.5 Meta anual de ventas — Etapa 3

- **Objetivo:** fijar una meta anual y medir el avance a medida que se cargan ventas.
- **Gestión de metas:**
  - Una meta por combinación `year + metric + alcance`. El alcance es global, por línea (`lotCategoryId`) o por producto (`productId`), nunca ambos a la vez.
  - `target > 0`. El año no puede ser anterior al año en curso − 1.
  - Una combinación duplicada → **409**.
  - Se registra el usuario y la fecha de creación y de modificación.
- **Filtro de fecha:** `year` (obligatorio) + `asOf` (fecha de corte, por defecto hoy; si el año ya terminó, el 31-dic).
- **Gráfico:** línea de ventas acumuladas por mes contra la línea de meta, con el ritmo parejo de la meta y la proyección al cierre. Barra de progreso.
- **Datos:** `goal {id, year, metric, target, scope}`, `monthly[] {month, value, cumulative, linearTarget, progressPct}`, `kpi {cumulative, progressPct, expectedToDate, gap, projection, projectionPct}`.
- **Fórmulas:**
  - `days = asOf − 1-ene + 1`
  - `daysInYear` = 365 o 366
  - `expectedToDate = target × days / daysInYear`
  - `gap = cumulative − expectedToDate`
  - `projection = cumulative / days × daysInYear`
- **CA:**
  1. El avance se calcula al consultar: cargar un archivo de ventas cambia el resultado sin ningún proceso adicional.
  2. `metric=cop` usa la venta neta de §2, con `ivaPct` y la regla de remisiones decidida (§9).
  3. Solo cuentan las ventas con `file_date` entre el 1-ene del año y `asOf`.
  4. Una meta por línea solo suma productos de esa línea. Una meta por producto, solo ese producto.
  5. Si no existe meta para la combinación pedida → **404** con un mensaje claro.
  6. Emite `SALE_DATE_IS_UPLOAD_DATE` según §3.1.

### R-3.1 Costo estándar vs real con semáforo — Etapa 3

- **Objetivo:** desviación de costo de materiales por orden cerrada.
- **Gráfico:** tabla con semáforo. Detalle por insumo al seleccionar una orden.
- **Fuente / fecha:** `orders` (`finalizada`), su snapshot `order_close` y `product_cost_snapshot_material` / `date_closed`.
- **Datos:** `orderId`, `batch`, `closedAt`, `mainProductName`, `lineName`, `realKg`, `standardCost`, `realCost`, `standardCopKg`, `realCopKg`, `variationCopKg`, `deviationPct`, `status` (`green|yellow|red`), `topCause {materialName, deviationCop}`.
- **Detalle por orden:** `materialType`, `materialName`, `standardQty`, `realQty`, `standardCost`, `realCost`, `deviationCop`, ordenado por |desviación| descendente.
- **Semáforo:** `red` si `deviationPct > thresholdPct`; `yellow` si `0 < deviationPct ≤ thresholdPct`; `green` si `deviationPct ≤ 0`.
- **CA:**
  1. `deviationPct = variationCopKg / standardCopKg × 100`. Si el estándar es 0 → `null` y estado `yellow`.
  2. `topCause` es el insumo con mayor desviación positiva.
  3. El filtro `status` devuelve solo las órdenes de ese color.
  4. Se informa explícitamente que **la mano de obra no está incluida** (`meta.notes`).
  5. Se emiten `MATERIAL_COST_INCOMPLETE` y `MULTI_PRODUCT_ORDER_COST` cuando apliquen.

### R-3.2 Mermas por lote — Etapa 2

- **Objetivo:** pérdidas valorizadas por orden y por tipo.
- **Gráfico:** barras apiladas por lote (granel, materia prima extra, empaque). Detalle por material.
- **Fuente / fecha:**
  - Granel: `orders` + snapshot (`date_closed`).
  - Materia prima: `feedstock_kardex` (`type='output'`, `classification='ajuste'`, `date_created`).
  - Empaque: `packaging_kardex` (mismo criterio).
- **Datos por lote:** `orderId`, `batch`, `closedAt`, `bulkLossKg`, `bulkLossCop`, `extraFeedstockKg`, `extraFeedstockCop`, `packagingLostUnits`, `packagingLostCop`, `totalLossCop`.
- **Detalle (`materialType`):** `orderId`, `batch`, `lineName`, `categoryName` (forma del material), `materialName`, `quantity`, `unit` (`kg` o `und`), `cop`.
- **Filtro `includeOutsideOrders`:** incluye los ajustes de salida sin orden (daño o vencimiento en bodega). Esos van en la línea "Sin línea".
- **CA:**
  1. `bulkLossCop = bulkLossKg × real_cost_material_kg` del cierre.
  2. **No** se usa `order_detail.charge_extra` de empaque como merma, porque incluye la diferencia FIFO.
  3. El empaque perdido se valoriza al costo del lote FIFO (`packaging_kardex.charge`).
  4. La línea de los materiales se reparte según la orden (§2).
  5. La suma del detalle por material es igual a los totales por lote.

### R-4.2 Vencimientos y rotación (FEFO) — Etapa 3

- **Objetivo:** lotes con saldo próximos a vencer y valor en riesgo.
- **Filtro de fecha:** rango de **vencimiento** `from`/`to`. El front envía por defecto hoy … hoy + 90 días. Se permite `from` en el pasado para ver lo ya vencido.
- **Gráfico:** tabla ordenada por vencimiento, con color: rojo ≤ 30 días, amarillo ≤ 60, sin color > 60. Opcionalmente, barras de valor en riesgo por mes de vencimiento.
- **Fuente:** kardex de materia prima (saldo por lote exacto) y de producto terminado (saldo estimado FIFO a partir del stock vigente).
- **Datos:** `subject`, `itemId`, `itemName`, `lineName` (solo producto terminado), `categoryName`, `batch`, `expiresAt`, `daysToExpire`, `balance`, `balanceUnit`, `valueAtRisk`, `estimated`.
- **CA:**
  1. Solo lotes con saldo > 0 (salvo `onlyWithBalance=false`).
  2. `expiresAt = min(expiration_date_1, expiration_date_2)` del lote.
  3. El saldo de producto terminado lleva `estimated=true` y se emite `ESTIMATED_LOT_BALANCE`.
  4. Para materia prima, `valueAtRisk = saldo × costo promedio ponderado actual`. Para producto terminado, saldo × costo por unidad del último snapshot.
  5. Empaque no aplica (no tiene vencimiento). Con `subject=packaging` → **400** con mensaje claro.

### R-G1 Tablero directivo — Etapa 2

- **Filtro de fecha:** `from`/`to`, por defecto el mes en curso. Cada tarjeta compara contra el período inmediatamente anterior de igual duración.
- **Tarjetas:**
  1. **Toneladas producidas** (R-1.1) con variación % frente al período anterior.
  2. **Facturación neta** (R-2.1 total) con variación %.
  3. **Margen neto global** = Σ utilidad neta / Σ venta neta, junto al margen bruto global.
  4. **Top 3 productos** por utilidad neta (R-2.3).
  5. *(Etapa 3)* **Meta anual** (R-2.5): meta global en COP del año de `to`. Si no existe → `null` y el front muestra "Sin meta definida".
- **CA:**
  1. Cada cifra coincide con el reporte de origen con los mismos filtros.
  2. En la Etapa 2 la respuesta trae las tarjetas 1 a 4; la 5 se agrega en la Etapa 3 sin cambiar las demás.
  3. Se emite la unión de las advertencias de los reportes de origen.
  4. Responde en una sola llamada en menos de 3 s.

---

## 6. Contrato común de respuesta

```json
{
  "meta": {
    "report": "production-volume",
    "dateField": "kardex_final_product.date_created",
    "filters": { "from": "2026-01-01", "to": "2026-09-30", "granularity": "month", "groupBy": "line" },
    "generatedAt": "2026-10-12T09:15:00-05:00",
    "notes": []
  },
  "warnings": [
    { "code": "UNCATEGORIZED_DATA", "message": "Hay registros sin línea de negocio o forma asignada.", "count": 3 }
  ],
  "totals": { "kg": 43840.0, "ton": 43.84, "orders": 112 },
  "data": [
    { "period": "2026-09-01", "lineId": "…", "lineName": "Alimentos", "categoryId": "…", "categoryName": "Jaleas", "kg": 1840.0, "ton": 1.84, "orders": 7 }
  ]
}
```

- Las filas son planas (sin series armadas). El front pivotea según el gráfico.
- Los errores siguen el formato actual de `GlobalExceptionHandler`: `{ success: false, errorCode, message }`.

---

## 7. Exportación

### 7.1 XLSX y CSV

- **CA:**
  1. Disponible para todos los reportes tabulares. Etapa 1: R-1.1, R-1.2, R-1.3, R-1.5 y R-2.1. Etapa 2: R-2.2 a R-2.4 y R-3.2. Etapa 3: R-2.5, R-3.1 y R-4.2.
  2. Acepta exactamente los mismos filtros que el reporte. Un filtro inválido da el mismo 400.
  3. XLSX: una hoja de datos con encabezados en español, formato numérico (kg 0.000, COP #,##0, % 0.00) y una hoja "Filtros y advertencias".
  4. CSV: UTF-8 con BOM, separador `;` (Excel en español), punto decimal.
  5. Nombre del archivo: `reporte-<id>-<from>_<to>.<ext>`.
  6. Límite de 50 000 filas; si se excede → 400 pidiendo acotar los filtros.

### 7.2 PDF consolidado — Etapa 3

Fuera del backend. El front lo genera con los gráficos renderizados (por ejemplo, con jsPDF). Si más adelante se requiere en el servidor, se agrega un adaptador con OpenPDF.

---

## 8. Fuera de alcance y prerrequisitos

| Reporte / filtro | Qué falta | Prerrequisito para habilitarlo |
|---|---|---|
| R-4.1 Rentabilidad por cliente | Entidad cliente; ventas sin cliente | Tabla `customers` y `sales_order.id_customer`; leer el tercero del archivo o pedirlo al cargar |
| R-4.3 DSO | Facturas, vencimientos, pagos, plazos | Importar la cartera de Siigo; depende de R-4.1 |
| Filtro **cliente** (todos) | Entidad cliente | Igual que R-4.1 |
| Filtro **lote** en ventas | Las ventas se descuentan con el lote genérico `SO-<archivo>` | Asignación automática FEFO al descontar ventas |
| Mano de obra en R-3.1 | Horas por orden | Tabla `order_labor` (horas normales, extra, tarifa) |

---

## 9. Decisiones de negocio pendientes

D-1 y D-6 afectan a las Etapas 1 y 2, pero no las bloquean: se trabaja con el supuesto y se informa con advertencias. Las demás bloquean ítems de la Etapa 3.

| # | Decisión | Supuesto mientras no se confirme | Afecta a |
|---|---|---|---|
| D-1 | ¿El "Total" de Siigo incluye IVA? | `ivaPct = 0` (se toma como venta neta). | Etapa 1 (R-2.1) y Etapa 2 (R-2.2 a R-2.4, R-G1) |
| D-2 | ¿La meta en COP se mide con o sin IVA? | Sin IVA (venta neta). | Etapa 3 (R-2.5) |
| D-3 | ¿Las remisiones valorizadas a precio de lista cuentan para la meta en COP? | Sí, y se informan con `REMISSIONS_VALUED_AT_LIST_PRICE`. | Etapa 3 (R-2.5) |
| D-4 | ¿Se necesitan metas mensuales? | No. La tabla queda preparada para agregar `month` sin romper el contrato. | Etapa 3 (R-2.5) |
| D-5 | ¿Se pedirá la fecha de venta al cargar el archivo? | No. Si se aprueba, `file_date` toma esa fecha y la advertencia `SALE_DATE_IS_UPLOAD_DATE` deja de emitirse para esos archivos. | Etapa 3 (M-1) |
| D-6 | ¿Quién cierra los períodos CIF con kg cada mes? | Sin responsable: los márgenes netos saldrán con `CIF_INCOMPLETE`. | Etapa 1 (R-1.5) y Etapa 2 (R-2.2 a R-2.4, R-G1) |
| D-7 | ¿Se retira el módulo *Soporte › Reportes* (`/soporte/reportes`), que hoy es una página vacía? | Sí. La ruta redirige a *Informes* y el módulo se quita de los roles (§11, M-5). | Etapa 3 (M-5) |
| D-8 | ¿El tablero directivo se muestra en la página de inicio? | Sí, para quien tenga permiso de lectura sobre *Informes*. Los demás ven la bienvenida actual (§11, M-6). | Etapa 3 (M-6) |
| D-9 | ¿Se acepta el semáforo de costo estándar vs real solo con materiales y empaque, sin mano de obra por orden? | Sí, con la nota "No incluye mano de obra". | Etapa 3 (R-3.1) |
| D-10 | ¿Se acepta que el saldo por lote de producto terminado sea estimado (sale primero lo más antiguo), o se requiere asignar el lote real en cada venta? | Se acepta el estimado, con la advertencia `ESTIMATED_LOT_BALANCE`. | Etapa 3 (R-4.2) |
| D-11 | ¿Basta con un PDF generado en el navegador, o se necesita un PDF del servidor (por ejemplo, para envío automático)? | Generado en el navegador. | Etapa 3 (R-G3) |

---

## 10. Requisitos de pantalla (front)

Los criterios de esta sección se verifican en el navegador contra la API real. Aplican además las reglas RG-xx.

### 10.1 Ubicación, navegación y permisos

| ID | Requisito |
|---|---|
| **UI-01 Ubicación** | Todos los reportes viven en una sola página: **Finanzas y administración › Informes** (`/finanzas-y-administracion/informes`). El menú lateral ya se genera desde los permisos del usuario, así que la entrada aparece sola cuando el rol tiene el submódulo. |
| **UI-02 Pestañas** | En la Etapa 1 la página tiene dos pestañas: **Producción** (R-1.1, R-1.2, R-1.3, R-1.5), que se abre por defecto, y **Ventas** (R-2.1). La Etapa 2 agrega **Tablero** (R-G1, pasa a ser la pestaña por defecto) y **Costeo** (R-3.2), y suma R-2.2 a R-2.4 a **Ventas**. La Etapa 3 agrega **Meta anual** (R-2.5) e **Inventario** (R-4.2), y suma R-3.1 a **Costeo**. Dentro de cada pestaña, un selector elige el reporte. |
| **UI-03 Estado en la URL** | La pestaña, el reporte y todos los filtros viven en la URL (`?tab=…&report=…&from=…`). Recargar la página o compartir el enlace muestra exactamente el mismo reporte. Al cambiar un filtro la URL se reemplaza; no se agrega una entrada al historial por cada cambio. |
| **UI-04 Sin permiso** | Un usuario sin lectura sobre *Informes* no ve la entrada en el menú; si entra por URL, ve el aviso de acceso denegado del sistema, no un error técnico. |
| **UI-05 Acciones de metas** *(Etapa 3)* | Los botones "Nueva meta", "Editar" y "Eliminar" solo se muestran con el permiso correspondiente sobre *Metas de venta*. El rol administrador los ve siempre. |

### 10.2 Barra de filtros (común a todos los reportes)

| ID | Requisito |
|---|---|
| **UI-10 Fecha siempre visible** | Todo reporte muestra el rango de fechas como primer filtro, con atajos: *Mes actual*, *Mes anterior*, *Últimos 3 meses*, *Año actual*, *Año anterior*. El rótulo indica qué fecha se filtra según `meta.dateField` (por ejemplo, "Fecha de cierre de la orden" o "Fecha de carga del archivo"). |
| **UI-11 Valores por defecto** | Mes en curso. *(Etapa 3)* R-4.2: hoy a hoy + 90 días, con el rótulo "Fecha de vencimiento". R-2.5: año en curso y corte hoy, con selector de año en lugar de rango. |
| **UI-12 Validación local** | El front impide `from > to` y rangos de más de 731 días antes de llamar a la API, con el mismo mensaje que daría el backend. |
| **UI-13 Filtros por reporte** | Solo se muestran los filtros que el reporte soporta según la matriz §4.1. Al cambiar de reporte se conservan los filtros compartidos (fecha, producto, línea, forma) y se descartan los que el nuevo no admite. |
| **UI-14 Selectores** | Producto, línea, forma, proveedor, bodega y tipo de CIF son selectores múltiples con búsqueda. Los catálogos salen de un solo llamado a la API de filtros. La lista de **forma** cambia al cambiar *Qué se mide* (producto, materia prima o empaque). "Sin línea" y "Sin forma" aparecen como opción al final. |
| **UI-15 Lote** | Campo de texto libre; busca por coincidencia parcial. Se aplica al soltar el teclado (con espera de medio segundo), no en cada tecla. |
| **UI-16 Cliente** | El filtro de cliente **no** se muestra (RG-17). |
| **UI-17 Limpiar** | Un botón "Limpiar filtros" vuelve a los valores por defecto del reporte. |
| **UI-18 Filtros activos** | Encima del gráfico se listan los filtros activos como etiquetas que se pueden quitar una a una. |

### 10.3 Presentación de cada reporte

| ID | Requisito |
|---|---|
| **UI-20 Estructura** | Cada reporte se muestra en una tarjeta con: título, advertencias, gráfico, tabla de datos y acciones (exportar XLSX y CSV; PDF en la Etapa 3). |
| **UI-21 Advertencias** | `warnings[]` se muestra encima del gráfico como avisos de tipo *warning* (o *info* para `SALE_DATE_IS_UPLOAD_DATE` y `ESTIMATED_LOT_BALANCE`), con el mensaje de la API. `CIF_INCOMPLETE` incluye un enlace a *Costos indirectos de fabricación*. |
| **UI-22 Estados** | Mientras carga: indicador de carga del sistema sobre la tarjeta, sin borrar el gráfico anterior. Sin datos: el mensaje "No hay datos para los filtros seleccionados" en lugar de un gráfico vacío. Error: el `message` de la API en un aviso de error, con botón "Reintentar". |
| **UI-23 Formato** | Números con formato colombiano (`es-CO`): miles con punto, decimales con coma. COP sin decimales con `$`; kg con 3 decimales; ton con 3; % con 2. Los ejes de los gráficos usan formato abreviado (por ejemplo, `$1,2 M`). |
| **UI-24 Tabla** | Tabla con ordenamiento por columna, encabezados en español y fila de totales cuando la API los envía. Las columnas numéricas se alinean a la derecha. |
| **UI-25 Interacción** | Al pasar el cursor sobre un punto o barra se ve el valor exacto con su unidad. Las series se pueden ocultar desde la leyenda. En R-3.2 (Etapa 2) y R-3.1 (Etapa 3), hacer clic en una fila abre el detalle por material. |
| **UI-26 Colores** | Cada línea de negocio tiene siempre el mismo color en todos los gráficos de la sesión. El semáforo usa los colores de éxito, advertencia y error del tema. Los gráficos respetan el modo claro y oscuro. |
| **UI-27 Pantallas pequeñas** | En anchos menores a 900 px, la barra de filtros se pliega en un panel y la tabla tiene desplazamiento horizontal propio; la página no se desplaza horizontalmente. |

### 10.4 Gráfico por reporte

| Reporte | Gráfico | Interacción específica |
|---|---|---|
| R-1.1 | Barras apiladas por período; serie según `groupBy`. | Conmutador kg / ton; conmutador *Qué se mide* (producto / materia prima). |
| R-1.2 | Dos líneas (año actual / anterior) + líneas punteadas de acumulado. | Conmutador mes / semana. Etiqueta de variación % del total. |
| R-1.3 | Barras agrupadas por lote (teórico, envasado, merma). | Tabla con rendimiento %; resaltado en rojo de las órdenes con merma ≥ `minLossPct`. |
| R-1.5 | Barras apiladas por mes (materia prima, empaque, CIF por tipo) + línea de total. | Conmutador COP/kg y COP/ton. |
| R-2.1 | Barras horizontales coloreadas por línea. | Conmutador de métrica (unidades / kg / $) y selector de *Top N*. |
| R-2.2 *(Etapa 2)* | Barras horizontales del margen; rojo ≤ 0 %, amarillo < 15 %, verde ≥ 15 %. | Conmutador bruto / neto y más / menos rentables. Productos sin costo marcados con un ícono. |
| R-2.3 *(Etapa 2)* | Barras de utilidad + curva de % acumulado en eje secundario. | Línea guía del 80 % y texto "N productos explican el 80 %". |
| R-2.4 *(Etapa 2)* | Burbujas con líneas de corte y nombre de cuadrante en cada esquina. | Conmutador de eje X (kg / $) y de corte (mediana / margen objetivo). |
| R-2.5 *(Etapa 3)* | Línea de acumulado real vs línea de meta, ritmo parejo y proyección punteada; barra de progreso. | Tarjetas: avance %, esperado a la fecha, brecha y proyección al cierre. |
| R-3.1 *(Etapa 3)* | Tabla con semáforo (punto de color) y gráfico de barras de desviación % por orden. | Filtro por color; clic en una orden abre el detalle por insumo en un panel. |
| R-3.2 *(Etapa 2)* | Barras apiladas por lote (granel, materia prima extra, empaque). | Pestañas de detalle por tipo de material. |
| R-4.2 *(Etapa 3)* | Tabla ordenada por vencimiento con color por días (≤ 30 rojo, ≤ 60 amarillo); barras de valor en riesgo por mes. | Conmutador materia prima / producto terminado. |
| R-G1 *(Etapa 2)* | Cuatro tarjetas KPI (cinco con la meta en la Etapa 3), con variación % (flecha y color) frente al período anterior. | Cada tarjeta lleva al reporte de origen con los mismos filtros. |

### 10.5 Exportación desde el front

| ID | Requisito |
|---|---|
| **UI-30 XLSX / CSV** | Los botones descargan el archivo que genera la API con **los mismos parámetros** que tiene la URL en ese momento. Mientras se genera, el botón muestra carga y queda deshabilitado. Un 400 (por ejemplo, más de 50 000 filas) se muestra como aviso con el mensaje de la API. |
| **UI-31 PDF** *(Etapa 3)* | El PDF se arma en el navegador con: título del reporte, filtros activos, advertencias, el gráfico como imagen y la tabla. En el Tablero, un botón "PDF consolidado" incluye todas las tarjetas. Formato carta horizontal. |
| **UI-32 Nombre** *(Etapa 3)* | El archivo PDF usa el mismo patrón de nombre que XLSX y CSV (§7.1). |

### 10.6 Gestión de metas (R-2.5) — Etapa 3

| ID | Requisito |
|---|---|
| **UI-40 Listado** | En la pestaña *Meta anual*, una tabla lista las metas del año elegido: alcance (Global / línea / producto), métrica, valor, último usuario que la modificó y fecha. |
| **UI-41 Crear** | Un diálogo pide año, métrica (COP / kg / unidades), alcance (global, una línea o un producto; excluyentes) y valor. Validaciones: valor > 0, año ≥ año actual − 1, alcance excluyente. Un 409 de la API se muestra como "Ya existe una meta para ese año, métrica y alcance". |
| **UI-42 Editar** | Solo se edita el valor. El alcance, el año y la métrica se muestran deshabilitados. |
| **UI-43 Eliminar** | Pide confirmación con el diálogo estándar del sistema. |
| **UI-44 Sin meta** | Si no hay meta para la combinación consultada, el gráfico se reemplaza por "No hay meta definida para este año y alcance" y, con permiso, el botón "Definir meta". |
| **UI-45 Refresco** | Después de crear, editar o eliminar, el listado y el avance se actualizan sin recargar la página. |

---

## 11. Cambios a funcionalidades existentes

Estos cambios son necesarios para que los reportes salgan completos o para que el sistema quede coherente con el nuevo módulo. Cada uno indica si toca back, front o ambos.

**Etapa 1:** M-3, M-4 (solo *Informes*), M-7 y M-8. **Etapa 2:** ninguno. **Etapa 3:** M-1 (D-5), M-4 (*Metas de venta*), M-5 (D-7) y M-6 (D-8).

| ID | Cambio | Back | Front | Motivo | Criterios de aceptación |
|---|---|---|---|---|---|
| **M-1** *(Etapa 3)* | **Fecha de venta al cargar archivos** (si se aprueba D-5). El formulario de carga de órdenes de venta pide una fecha de venta, con hoy por defecto. | Parámetro opcional `saleDate` en las dos cargas de archivo; si viene, se guarda como fecha del archivo; si no, se usa hoy (comportamiento actual). | Selector de fecha en el formulario de carga; se envía con el archivo. La fecha se muestra en el listado y el detalle de órdenes de venta. | Elimina el desfase de la advertencia `SALE_DATE_IS_UPLOAD_DATE`. | 1. Sin fecha, todo funciona igual que hoy. 2. Fecha futura → 400 "La fecha de venta no puede ser futura". 3. Fecha de más de 1 año atrás → 400. 4. Los reportes de ventas usan la fecha elegida. 5. La advertencia deja de emitirse si **todas** las órdenes del rango tienen fecha de venta informada. |
| ~~M-2~~ | **Descartado: ya existe.** La forma (categoría) de un producto se asigna al crearlo y se puede asignar o cambiar después desde el detalle del producto (tarjeta *Categoria* → "Cambiar Categoria"; muestra "Sin categoria" si no tiene). La tarea 0.1 del plan se hace desde ahí. | — | — | — | — |
| **M-3** | **Indicador de datos sin clasificar.** | La API de filtros devuelve cuántos productos, materias primas y empaques activos no tienen línea o forma. | En la barra de filtros, si el conteo es > 0, un aviso "Hay N productos sin línea o forma" con enlace al listado correspondiente. | Hace visible la causa de `UNCATEGORIZED_DATA`. | El conteo coincide con la consulta de control de la tarea 0.1. |
| **M-4** | **Permisos de Informes (Etapa 1) y Metas (Etapa 3).** | La migración registra el submódulo *Informes* si no existe (en desarrollo ya existe) y el nuevo *Metas de venta*, y se los asigna al rol administrador. Los endpoints usan esos paths (RG-14). | Constantes nuevas de campo de permiso para *Informes* y *Metas de venta*; los botones de metas usan esos permisos. | Hoy *Informes* existe en los datos de desarrollo pero no en ninguna migración: una base limpia no lo tendría. | 1. Una base limpia, tras migrar, tiene ambos submódulos. 2. En la pantalla de roles se pueden asignar como cualquier otro. 3. Un rol sin *Metas de venta* no ve los botones y la API le responde 403. |
| **M-5** *(Etapa 3)* | **Retirar *Soporte › Reportes*** (D-7). | La migración quita los privilegios y la fila del submódulo `/soporte/reportes`. | La página `/soporte/reportes` redirige a `/finanzas-y-administracion/informes`. | Evita dos entradas de menú para lo mismo; la actual es una página vacía. | 1. El menú ya no muestra *Soporte › Reportes*. 2. Un enlace guardado a la ruta vieja llega a Informes. |
| **M-6** *(Etapa 3)* | **Tablero en la página de inicio** (D-8). | Sin cambio (usa el endpoint del tablero). | `/home` muestra las tarjetas de R-G1 del mes en curso a quien tenga lectura sobre *Informes*, con enlace "Ver informes". Quien no tenga permiso ve la bienvenida actual. | La página de inicio hoy solo muestra un saludo. | 1. Usuario con permiso ve las 5 tarjetas. 2. Usuario sin permiso no recibe un error ni hace la llamada. |
| **M-7** | **Enlace desde CIF.** | Sin cambio. | En la vista de período CIF, si el período no está cerrado y es de un mes anterior, un aviso "Cierre este período para que los informes incluyan costos indirectos". | Ataca la causa de `CIF_INCOMPLETE` (D-6). | El aviso solo aparece en períodos abiertos de meses vencidos. |
| **M-8** | **Documentación del proyecto.** | `CLAUDE.md` del back: `ddl-auto` es `validate` (no `update`); agregar `/api/reports` a las rutas base. | `AGENTS.md`: agregar la ruta `/finanzas-y-administracion/informes`, el dominio `reports` en la capa de API y la librería de gráficos. | Las guías hoy describen mal la persistencia y no incluirían el módulo. | Las guías reflejan el estado real. |

Cambios que **no** se hacen en esta entrega: entidad cliente, asignación FEFO de lote en ventas, registro de tiempos de planta y mano de obra por orden (ver §8).
