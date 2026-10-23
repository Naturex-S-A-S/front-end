# Plan de ejecución — Informes (API `/api/reports` y pantallas del front)

> Versión 4 · 19 oct 2026 (v3: 16 oct 2026 · v2: 15 oct 2026 · v1: 12 oct 2026)
> Especificación funcional: [`reports-specs.md`](reports-specs.md). Los códigos R-x.x, RG-xx, UI-xx, M-x, CA y D-x se refieren a ese documento.
>
> **Cambios en v4:** R-1.4 (capacidad de planta / OEE) y R-3.3 (tiempos de limpieza) se retiran del alcance por falta de información. La entrega pasa de dos rondas a **tres etapas**. Este plan detalla la **Etapa 1** (R-1.1, R-1.2, R-1.3, R-1.5 y R-2.1); la Etapa 2 está en §10 y la Etapa 3 en §11. La vista de ventas se crea en la Etapa 1 solo con la valorización; las columnas de costo se agregan en la Etapa 2.
>
> **Cambios en v3:** solo informes viables en la primera entrega; lo que depende de decisiones se aplaza.
>
> **Cambios en v2:** la migración pasa a **V10** (V9 ya existe: `V9__product_cost_snapshot_used_cif.sql`); permisos sobre *Finanzas y administración › Informes*; cambios a funcionalidades existentes; fases y diseño del front; pruebas del front.

## 0. Objetivo

Crear un nuevo REST de solo lectura que entregue al front los datos ya calculados de cada gráfico, y las pantallas que los consumen, con:

- filtros validados (rango de fechas obligatorio en todos);
- advertencias de calidad del dato;
- exportación a XLSX y CSV (servidor);
- una página *Informes* en el front con pestañas, barra de filtros en la URL, gráficos y tablas;
- los ajustes de §11 de las specs que no dependen de decisiones: permiso de *Informes*, conteo de datos sin clasificar, aviso en CIF y documentación.

El back respeta la arquitectura hexagonal actual y las reglas de `ArchitectureTest`. El front sigue `front-end/AGENTS.md` (Server Components + `apiFetch` para leer, Server Actions para mutar, filtros en `searchParams`).

### Alcance por etapa

| Etapa | Informes | Transversal | Detalle |
|---|---|---|---|
| **1 (ahora)** | R-1.1, R-1.2, R-1.3, R-1.5 · R-2.1 | Base común (contrato, validación, `ReportSqlBuilder`, catálogos de filtros) · vista de ventas con valorización · exportación XLSX / CSV de esos 5 informes · B-3, B-4 (*Informes*), B-7, B-8, B-9 | §1 a §9 |
| **2** | R-2.2, R-2.3, R-2.4 · R-3.2 · R-G1 con 4 tarjetas | Columnas de costo en la vista de ventas · exportación de los informes nuevos · pestañas *Tablero* y *Costeo* | §10 |
| **3** | R-2.5 · R-3.1 · R-4.2 · R-G3 PDF · tarjeta de meta en R-G1 | B-1 (M-1), B-5 (M-5), B-6 (M-6), permiso *Metas de venta* | §11 |

Fuera de las tres etapas: R-4.1 y R-4.3 (specs §8). En la estructura de paquetes y en los endpoints, lo de las Etapas 2 y 3 queda marcado: el diseño lo contempla, pero no se implementa ahora.

**Por qué este corte:** los cinco informes de la Etapa 1 solo leen volúmenes, kárdex, cierres de orden y venta valorizada. Ninguno necesita costear cada línea de venta, que es la parte más delicada (último cierre del producto antes de la venta, snapshot del precio, CIF, comisión) y la que comparten R-2.2 a R-2.4 y el tablero. Esa lógica se construye y se valida con Naturex en la Etapa 2, sobre una base ya probada.

---

## 1. Decisiones de diseño

| # | Decisión | Motivo |
|---|---|---|
| A-1 | Las consultas de reportes son **SQL nativo** ejecutado con `NamedParameterJdbcTemplate` en el adaptador `jpa-repository`. Sin entidades JPA. | Son agregaciones con CTE, `LATERAL` y funciones de ventana que JPQL no soporta. `spring-data-jdbc` ya es dependencia del módulo. Como no hay entidades, `ddl-auto: validate` no se ve afectado. |
| A-2 | Los filtros opcionales se arman con un **`ReportSqlBuilder`** que agrega `AND … IN (:ids)` solo cuando el filtro viene informado. | El patrón `(:x IS NULL OR …)` no funciona bien con listas en PostgreSQL y degrada el plan de ejecución. |
| A-3 | La base compartida del bloque 2 va como **vista** `reports.v_sales_line_costed` en Flyway. **Etapa 1:** solo la valorización (cantidad, kg, Total de Siigo, precio vigente de las remisiones). **Etapa 2:** `CREATE OR REPLACE VIEW` que agrega al final las columnas de costo. | La reutilizan R-2.1 a R-2.5 y R-G1, así que la lógica de valorización vive en un solo lugar y se puede auditar con SQL. El IVA **no** va en la vista: se aplica en la consulta con `:ivaPct`. Partirla evita publicar en la Etapa 1 una lógica de costeo que nadie va a usar ni validar todavía. |
| A-4 | *(Etapa 3)* Las metas usan una **entidad JPA normal** (`reports.sales_goal`) con migración Flyway. | Es un CRUD simple; sigue el patrón `XxxEntity` ↔ `XxxRepositoryAdapter`. |
| A-5 | Las respuestas siguen un **contrato común** `ReportResult<T>` (`meta`, `warnings`, `totals`, `data`) definido en el dominio, con su DTO en `api-rest`. | Es lo que pide la especificación §6: el front reutiliza un mismo componente de advertencias y metadatos. |
| A-6 | La validación de filtros vive en el **use case**, no en el controlador. | Las reglas RG-01, RG-02 y los rangos son reglas de negocio; además el endpoint de exportación las reutiliza. |
| A-7 | La exportación usa un gateway de dominio `ReportExportGateway`, implementado en el módulo `poi`. | POI ya está en el stack; mismo patrón que `ExcelReaderGateway`. |
| A-8 | Nada de este trabajo toca `ProductCostUseCase`, los use cases de kardex ni las fórmulas de costeo. | RG-16. Los reportes leen snapshots tal como están. |
| A-9 | Permisos sobre el submódulo **existente** *Informes* (`/finanzas-y-administracion/informes`, id 29 en desarrollo) y, en la Etapa 3, uno nuevo *Metas de venta* (`/finanzas-y-administracion/informes/metas`). No se crea un módulo `/reports`. | `PermissionChecker` compara el path exacto contra el árbol del JWT, y el menú del front se genera desde ese árbol: el path del permiso **es** la ruta del front. |
| A-10 | Front: **ApexCharts** (`apexcharts` + `react-apexcharts`), cargado con `next/dynamic` y `ssr: false`. | No hay librería de gráficos instalada. ApexCharts cubre todos los tipos pedidos (apilado, combinado con eje secundario, burbujas), toma los colores del tema MUI y exporta el gráfico a imagen (`dataURI`), que servirá para el PDF de la Etapa 3. |
| A-11 | Front: los reportes se leen en **Server Components** con `apiFetch` a partir de los `searchParams`; los filtros cambian la URL con `router.replace()`. | Es el patrón de `AGENTS.md` y cumple UI-03 (enlace compartible) sin estado de cliente. |
| A-12 | Front: un **registro de reportes** (`src/utils/reports/registry.ts`) define por cada `reportKey` su pestaña, endpoint, filtros admitidos, valores por defecto, rótulo de fecha, columnas y componente de gráfico. | Una sola fuente para la barra de filtros (UI-13), la exportación (UI-30) y la prueba que garantiza que **todo** reporte tiene filtro de fecha. Las etapas siguientes solo agregan entradas. |
| A-13 | Front: XLSX y CSV los genera el **back**; el front solo descarga el `blob`. El PDF *(Etapa 3)* lo arma el front con `jspdf` + `jspdf-autotable`. | Specs §7. `xlsx-js-style`, ya instalado, no se usa aquí para no duplicar la lógica de formato. |

---

## 2. Estructura de paquetes (back)

La estructura del front está en §7.1. Lo que no tiene marca es de la Etapa 1.

```
domain/model/src/main/java/co/com/naturex/model/report/
├── ReportFilter.java                 // @Builder: from, to, granularity, productIds, batch, lotCategoryIds, categoryIds, subject, groupBy, unit, origin, ...
├── ReportResult.java                 // <T> meta, warnings, totals, data
├── ReportMeta.java                   // report, dateField, filters (Map), generatedAt, notes
├── ReportWarning.java                // code (enum), message, count
├── ReportWarningCode.java            // specs §3.1 (todos los códigos; los de etapas siguientes quedan sin uso hasta entonces)
├── enums/                            // Granularity, Subject, GroupBy, VolumeUnit, SalesOrigin, Metric · Etapa 2: MarginType, Quadrant · Etapa 3: SemaphoreStatus
├── production/                       // ProductionVolumeRow, ProductionComparisonRow, MassBalanceRow, CostPerKgRow, CifTypeCost
├── sales/                            // TopProductRow · Etapa 2: ProfitabilityRow, ParetoRow, MatrixPoint
├── costing/                          // (Etapa 2) WasteByBatchRow, WasteDetailRow · (Etapa 3) StandardVsRealRow, StandardVsRealMaterialRow
├── inventory/                        // (Etapa 3) ExpirationRow
├── dashboard/                        // (Etapa 2) DashboardKpis
├── goal/                             // (Etapa 3)
│   ├── SalesGoal.java
│   ├── SalesGoalProgress.java        // goal, monthly[], kpi
│   └── gateways/SalesGoalRepository.java
├── filters/ReportFiltersCatalog.java // líneas, formas, productos, proveedores, orígenes, tipos de CIF, uncategorized
├── export/ExportFormat.java          // XLSX, CSV
└── gateways/
    ├── ReportRepository.java         // un método por reporte; recibe ReportFilter, devuelve filas crudas + flags
    └── ReportExportGateway.java      // byte[] export(String title, List<ExportColumn>, List<Map<String,Object>>, Map<String,String> filters, List<ReportWarning>, ExportFormat)

domain/model/src/main/java/co/com/naturex/model/exceptions/
├── InvalidReportFilterException.java     // → 400
├── SalesGoalNotFoundException.java       // → 404 (Etapa 3)
└── SalesGoalAlreadyExistsException.java  // → 409 (Etapa 3)

domain/usecase/src/main/java/co/com/naturex/usecase/report/
├── ReportFilterValidator.java        // RG-01, RG-02 y rangos por reporte (top 1..100, ivaPct 0..100, ...)
├── ReportFiltersUseCase.java         // catálogos para los selectores (GET /filters)
├── ProductionReportUseCase.java      // R-1.1, R-1.2, R-1.3, R-1.5
├── SalesReportUseCase.java           // R-2.1 · Etapa 2: R-2.2 a R-2.4
├── CostingReportUseCase.java         // (Etapa 2) R-3.2 · (Etapa 3) R-3.1
├── DashboardUseCase.java             // (Etapa 2) R-G1
├── SalesGoalUseCase.java             // (Etapa 3) CRUD de metas + R-2.5
├── InventoryReportUseCase.java       // (Etapa 3) R-4.2
└── ReportExportUseCase.java          // R-G2: ejecuta el reporte pedido y delega en ReportExportGateway

infrastructure/driven-adapters/jpa-repository/src/main/java/co/com/naturex/jpa/report/
├── ReportRepositoryAdapter.java      // implements ReportRepository
├── ReportSqlBuilder.java             // WHERE dinámico + MapSqlParameterSource
├── ReportQueries.java                // SQL en text blocks, uno por reporte
├── ReportRowMappers.java             // RowMapper por tipo de fila
└── goal/ (Etapa 3) SalesGoalEntity, SalesGoalJpaRepository, SalesGoalMapper, SalesGoalRepositoryAdapter

infrastructure/driven-adapters/poi/src/main/java/co/com/naturex/poi/
└── ReportExportAdapter.java          // implements ReportExportGateway (SXSSFWorkbook para XLSX; CSV manual)

infrastructure/entry-points/api-rest/src/main/java/co/com/naturex/api/
├── ReportRest.java                   // GET /api/reports/**
├── SalesGoalRest.java                // (Etapa 3) /api/reports/goals/**
├── dto/report/                       // ReportResponseDTO<T>, WarningDTO, MetaDTO, filas DTO · Etapa 3: SalesGoalRequest, SalesGoalDTO
└── mapper/ReportFilterMapper.java    // @RequestParam → ReportFilter (parseo de enums y listas)
```

`UseCasesConfig` detecta los use cases solo, por la regex `^.+UseCase$`. **`ReportFilterValidator` no termina en `UseCase`**, así que no se registra como bean: se instancia dentro de cada use case. Si se prefiere inyectarlo, hay que renombrarlo `ReportFilterValidatorUseCase`.

---

## 3. Endpoints

Todos van en `ReportRest`, con `@RequiresPermission(path = "/finanzas-y-administracion/informes", method = "GET")` a nivel de clase, salvo las metas (§11.2). Filtros comunes en todos: `from`, `to` (obligatorios), `productIds`, `lotCategoryIds`, `categoryIds`. Los demás se indican por endpoint.

### 3.1 Reportes

| Método y ruta | Reporte | Etapa | Filtros adicionales | `data[]` |
|---|---|---|---|---|
| `GET /api/reports/production/volume` | R-1.1 | 1 | `subject` (product/feedstock), `granularity`, `groupBy`, `unit`, `batch`, `formulationId`, `providerIds` | `ProductionVolumeRow` |
| `GET /api/reports/production/comparison` | R-1.2 | 1 | `granularity` (month/week), `unit` | `ProductionComparisonRow` |
| `GET /api/reports/production/mass-balance` | R-1.3 | 1 | `batch`, `formulationId`, `versionId`, `minLossPct` | `MassBalanceRow` |
| `GET /api/reports/production/cost-per-kg` | R-1.5 | 1 | `granularity`, `unit`, `batch`, `cifTypeIds` | `CostPerKgRow` |
| `GET /api/reports/sales/top-products` | R-2.1 | 1 | `origin`, `metric`, `top`, `ivaPct` | `TopProductRow` |
| `GET /api/reports/filters` | Catálogos para los selectores | 1 | `subject` | `ReportFiltersCatalog`: líneas, formas según `subject`, productos activos (sin los de prueba), proveedores, orígenes, tipos de CIF y `uncategorized {products, feedstock, packaging}` (M-3) |
| `GET /api/reports/{reportKey}/export` | R-G2 | 1 | `format` (xlsx/csv) + los filtros del reporte | `byte[]` con `Content-Disposition` |
| `GET /api/reports/sales/profitability` | R-2.2 | 2 | `origin`, `marginType`, `sort`, `top`, `ivaPct` | `ProfitabilityRow` |
| `GET /api/reports/sales/profit-pareto` | R-2.3 | 2 | `origin`, `top`, `ivaPct` | `ParetoRow` |
| `GET /api/reports/sales/volume-margin-matrix` | R-2.4 | 2 | `origin`, `ivaPct`, `xAxis`, `cut` | `MatrixPoint` |
| `GET /api/reports/costing/waste` | R-3.2 | 2 | `batch`, `includeOutsideOrders` | `WasteByBatchRow` |
| `GET /api/reports/costing/waste/detail` | R-3.2 detalle | 2 | `materialType` (obligatorio), `batch`, `providerIds`, `includeOutsideOrders` | `WasteDetailRow` |
| `GET /api/reports/dashboard` | R-G1 (4 tarjetas; la de meta en la Etapa 3) | 2 | `ivaPct` | `DashboardKpis` (objeto, no lista) |
| `GET /api/reports/costing/standard-vs-real` | R-3.1 | 3 | `batch`, `thresholdPct`, `status` | `StandardVsRealRow` |
| `GET /api/reports/costing/standard-vs-real/{orderId}/materials` | R-3.1 detalle | 3 | `materialType` | `StandardVsRealMaterialRow` |
| `GET /api/reports/inventory/expiration` | R-4.2 (`from`/`to` = vencimiento) | 3 | `subject` (product/feedstock), `batch`, `warehouseIds`, `rackIds`, `onlyWithBalance` | `ExpirationRow` |

`reportKey` de la exportación:

- **Etapa 1:** `production-volume`, `production-comparison`, `mass-balance`, `cost-per-kg`, `top-products`.
- **Etapa 2** agrega `profitability`, `profit-pareto`, `volume-margin-matrix`, `waste`, `waste-detail`.
- **Etapa 3** agrega `goal-progress`, `standard-vs-real`, `expiration`.

Un `reportKey` desconocido, o de una etapa todavía no implementada → 400.

En la Etapa 1, `GET /filters` ya devuelve todos los catálogos (incluidos proveedores y tipos de CIF, que usan R-1.1 y R-1.5). Las etapas siguientes no lo cambian.

Las metas (`SalesGoalRest`) están en §11.2; sus ejemplos, en §3.2.

### 3.2 Ejemplos de respuesta

Lo que recibe el front de cada endpoint, con el contrato de specs §6. Las cifras salen de los datos ilustrativos del informe de viabilidad ([`reportes-viabilidad.html`](reportes-viabilidad.html)): mismos productos, lotes y órdenes en todos los ejemplos, de modo que los totales cuadran entre reportes. Las columnas de cada fila son las que devuelven las consultas de ese informe, renombradas al contrato de la especificación.

Convenciones de los ejemplos:

- Los ids se abrevian (`"lc-alim"`, `"fp-crema"`); en la API son los ids reales de cada tabla.
- `// …` marca filas omitidas. Los `totals` siempre corresponden a **todas** las filas, no solo a las mostradas.
- Números sin formato (RG-09): kg y ton con 3 decimales, COP enteros, porcentajes con 2 decimales. `null` cuando el valor no se puede calcular.
- Fechas `yyyy-MM-dd`; marcas de tiempo ISO 8601 con zona `-05:00`.

#### Etapa 1

**`GET /api/reports/production/volume`** (R-1.1) · `?from=2026-08-01&to=2026-09-30&subject=product&groupBy=line&unit=kg&granularity=month`

Base: consulta 1.1. Una fila por período × línea × forma; el front agrupa según `groupBy`.

```jsonc
{
  "meta": {
    "report": "production-volume",
    "dateField": "kardex_final_product.date_created",
    "filters": { "from": "2026-08-01", "to": "2026-09-30", "subject": "product", "groupBy": "line", "unit": "kg", "granularity": "month" },
    "generatedAt": "2026-10-19T09:15:00-05:00",
    "notes": []
  },
  "warnings": [
    { "code": "UNCATEGORIZED_DATA", "message": "Hay registros sin línea de negocio o forma asignada.", "count": 1 }
  ],
  "totals": { "kg": 11435.500, "ton": 11.436, "orders": 41 },
  "data": [
    { "period": "2026-08-01", "lineId": "lc-alim", "lineName": "Alimentos", "categoryId": "pc-jaleas", "categoryName": "Jaleas", "kg": 1650.000, "ton": 1.650, "orders": 6 },
    // … 5 filas más de agosto
    { "period": "2026-09-01", "lineId": "lc-alim", "lineName": "Alimentos", "categoryId": "pc-jaleas", "categoryName": "Jaleas", "kg": 1840.000, "ton": 1.840, "orders": 7 },
    { "period": "2026-09-01", "lineId": "lc-cosm", "lineName": "Cosméticos", "categoryId": "pc-cremas", "categoryName": "Cremas / emulsiones", "kg": 720.000, "ton": 0.720, "orders": 4 },
    { "period": "2026-09-01", "lineId": null, "lineName": "Sin línea", "categoryId": null, "categoryName": "Sin forma", "kg": 35.500, "ton": 0.036, "orders": 1 }
    // … 4 filas más de septiembre
  ]
}
```

Con `subject=feedstock` (consulta 1.1b) la forma sale del catálogo de materia prima y la línea se hereda de la orden con reparto, así que los kg pueden tener decimales aunque los movimientos no los tengan. `orders` cuenta la orden en cada línea a la que aporta.

```jsonc
{
  "meta": { "report": "production-volume", "dateField": "feedstock_kardex.date_created", "filters": { "from": "2026-09-01", "to": "2026-09-30", "subject": "feedstock", "groupBy": "category", "unit": "kg", "granularity": "month" }, "generatedAt": "2026-10-19T09:16:00-05:00", "notes": [] },
  "warnings": [],
  "totals": { "kg": 6212.870, "ton": 6.213, "orders": 23 },
  "data": [
    { "period": "2026-09-01", "lineId": "lc-alim", "lineName": "Alimentos", "categoryId": "fc-frutas", "categoryName": "Frutas", "kg": 912.437, "ton": 0.912, "orders": 7 },
    { "period": "2026-09-01", "lineId": "lc-cosm", "lineName": "Cosméticos", "categoryId": "fc-bases", "categoryName": "Bases emolientes", "kg": 310.250, "ton": 0.310, "orders": 4 }
    // …
  ]
}
```

**`GET /api/reports/production/comparison`** (R-1.2) · `?from=2026-01-01&to=2026-09-30&granularity=month&unit=ton`

Base: consulta 1.2. `periodLabel` es el mes (`"01"` a `"12"`) o la semana ISO (`"W01"` a `"W53"`); así se alinean los dos años. Acumulados y variación los calcula el use case.

```jsonc
{
  "meta": {
    "report": "production-comparison",
    "dateField": "kardex_final_product.date_created",
    "filters": { "from": "2026-01-01", "to": "2026-09-30", "granularity": "month", "unit": "ton", "previousFrom": "2025-01-01", "previousTo": "2025-09-30" },
    "generatedAt": "2026-10-19T09:15:00-05:00",
    "notes": []
  },
  "warnings": [],
  "totals": { "current": 43.840, "previous": 38.300, "variationPct": 14.46 },
  "data": [
    { "periodLabel": "01", "current": 4.080, "previous": 3.600, "currentCumulative": 4.080, "previousCumulative": 3.600, "variationPct": 13.33 },
    { "periodLabel": "02", "current": 4.200, "previous": 3.800, "currentCumulative": 8.280, "previousCumulative": 7.400, "variationPct": 10.53 },
    // … marzo a agosto
    { "periodLabel": "09", "current": 5.980, "previous": 5.000, "currentCumulative": 43.840, "previousCumulative": 38.300, "variationPct": 19.60 }
  ]
}
```

Si el año anterior no tiene datos: `previous: 0`, `variationPct: null` y advertencia `NO_PREVIOUS_YEAR_DATA`.

**`GET /api/reports/production/mass-balance`** (R-1.3) · `?from=2026-09-01&to=2026-09-30`

Base: consulta 1.3. Una fila por orden cerrada; `totals.lossPct` es ponderado (Σ merma / Σ teórico).

```jsonc
{
  "meta": { "report": "mass-balance", "dateField": "orders.date_closed", "filters": { "from": "2026-09-01", "to": "2026-09-30" }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [],
  "totals": { "expectedKg": 2470.000, "producedKg": 2385.900, "lossKg": 84.100, "lossPct": 3.40, "orders": 6 },
  "data": [
    {
      "orderId": 44, "batch": "L2609-044", "closedAt": "2026-09-24T16:40:00-05:00",
      "products": [{ "productId": "fp-kombucha", "productName": "Kombucha jengibre 500 ml" }],
      "lines": [{ "lineId": "lc-alim", "lineName": "Alimentos" }],
      "expectedKg": 500.000, "producedKg": 472.000, "lossKg": 28.000, "lossPct": 5.60, "yieldPct": 94.40, "extraFeedstockKg": 1.800
    },
    {
      "orderId": 41, "batch": "L2609-041", "closedAt": "2026-09-18T11:05:00-05:00",
      "products": [{ "productId": "fp-jalea", "productName": "Jalea de mora 250 g" }],
      "lines": [{ "lineId": "lc-alim", "lineName": "Alimentos" }],
      "expectedKg": 300.000, "producedKg": 288.800, "lossKg": 11.200, "lossPct": 3.73, "yieldPct": 96.27, "extraFeedstockKg": 0.650
    },
    {
      "orderId": 39, "batch": "L2609-039", "closedAt": "2026-09-12T15:20:00-05:00",
      "products": [{ "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g" }],
      "lines": [{ "lineId": "lc-cosm", "lineName": "Cosméticos" }],
      "expectedKg": 200.000, "producedKg": 198.400, "lossKg": 1.600, "lossPct": 0.80, "yieldPct": 99.20, "extraFeedstockKg": 0.000
    }
    // … L2609-036, L2609-043, L2609-047
  ]
}
```

**`GET /api/reports/production/cost-per-kg`** (R-1.5) · `?from=2026-08-01&to=2026-09-30&granularity=month&unit=kg`

Base: consulta 1.5. Promedios ponderados por kg. Con `unit=ton` cambian los valores de las columnas `*CopKg` (× 1000), no sus nombres; `totalCopTon` siempre viene.

```jsonc
{
  "meta": { "report": "cost-per-kg", "dateField": "product_cost_snapshot.date_snapshot", "filters": { "from": "2026-08-01", "to": "2026-09-30", "granularity": "month", "unit": "kg" }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [
    { "code": "MULTI_PRODUCT_ORDER_COST", "message": "En órdenes con varios productos el costo corresponde a la orden completa.", "count": 2 }
  ],
  "totals": { "kg": 11400.000, "feedstockCopKg": 12034, "packagingCopKg": 4294, "cifCopKg": 1919, "totalCopKg": 18247, "totalCopTon": 18246877 },
  "data": [
    {
      "period": "2026-08-01", "kg": 5420.000,
      "feedstockCopKg": 11840, "packagingCopKg": 4310, "cifCopKg": 1950,
      "cifByType": [
        { "typeId": 1, "typeName": "Mano de obra", "copKg": 970 },
        { "typeId": 2, "typeName": "Servicios públicos", "copKg": 610 },
        { "typeId": 3, "typeName": "Arriendo", "copKg": 370 }
      ],
      "totalCopKg": 18100, "totalCopTon": 18100000, "cifIncomplete": false, "materialIncomplete": false
    },
    {
      "period": "2026-09-01", "kg": 5980.000,
      "feedstockCopKg": 12210, "packagingCopKg": 4280, "cifCopKg": 1890,
      "cifByType": [
        { "typeId": 1, "typeName": "Mano de obra", "copKg": 940 },
        { "typeId": 2, "typeName": "Servicios públicos", "copKg": 600 },
        { "typeId": 3, "typeName": "Arriendo", "copKg": 350 }
      ],
      "totalCopKg": 18380, "totalCopTon": 18380000, "cifIncomplete": false, "materialIncomplete": false
    }
  ]
}
```

Mientras no haya períodos CIF cerrados con kg (D-6), `cifCopKg` y `cifByType` vienen en 0 / `[]`, `cifIncomplete: true` y se emite `CIF_INCOMPLETE`.

**`GET /api/reports/sales/top-products`** (R-2.1) · `?from=2026-01-01&to=2026-09-30&metric=cop&top=3`

Base: consulta 2.1 sobre la vista de valorización. `top` limita `data`; `totals` cubre todo el período.

```jsonc
{
  "meta": { "report": "top-products", "dateField": "sales_order.file_date", "filters": { "from": "2026-01-01", "to": "2026-09-30", "metric": "cop", "top": 3, "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [
    { "code": "SALE_DATE_IS_UPLOAD_DATE", "message": "La fecha de venta corresponde a la fecha de carga del archivo. Si el archivo se subió tarde, las ventas pueden aparecer en otro período.", "count": null },
    { "code": "REMISSIONS_VALUED_AT_LIST_PRICE", "message": "37 líneas de remisión se valorizaron con el precio de venta vigente.", "count": 37 },
    { "code": "REMISSIONS_WITHOUT_PRICE", "message": "2 líneas de remisión no tienen precio vigente y suman $0.", "count": 2 }
  ],
  "totals": { "units": 27650, "kg": 12273.500, "netSales": 364660000, "products": 10 },
  "data": [
    { "rank": 1, "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g", "lineName": "Cosméticos", "categoryName": "Cremas / emulsiones", "units": 3900, "kg": 468.000, "netSales": 72150000, "valuedRemissionLines": 4 },
    { "rank": 2, "productId": "fp-granola", "productName": "Granola orgánica 400 g", "lineName": "Alimentos", "categoryName": "Orgánico", "units": 2900, "kg": 1160.000, "netSales": 48720000, "valuedRemissionLines": 0 },
    { "rank": 3, "productId": "fp-kombucha", "productName": "Kombucha jengibre 500 ml", "lineName": "Alimentos", "categoryName": "Fermento", "units": 6100, "kg": 3050.000, "netSales": 43920000, "valuedRemissionLines": 12 }
  ]
}
```

**`GET /api/reports/filters`** · `?subject=product`

No es un reporte: no lleva `from`/`to` ni el sobre `ReportResult`. Devuelve el objeto directamente.

```jsonc
{
  "lines": [
    { "id": "lc-alim", "name": "Alimentos" },
    { "id": "lc-cosm", "name": "Cosméticos" }
  ],
  "categories": [                       // product_categories con subject=product; feedstock_categories o packaging_categories según subject
    { "id": "pc-jaleas", "name": "Jaleas" },
    { "id": "pc-cremas", "name": "Cremas / emulsiones" }
    // …
  ],
  "products": [                         // activos, sin productos de prueba
    { "id": "fp-crema", "name": "Crema hidratante aloe 120 g", "lineId": "lc-alim", "categoryId": "pc-cremas" }
    // …
  ],
  "providers": [{ "id": 12, "name": "Agroinsumos del Valle" }],
  "origins": [{ "id": "siigo", "name": "Ventas Siigo" }, { "id": "remision", "name": "Remisión" }],
  "cifTypes": [{ "id": 1, "name": "Mano de obra" }, { "id": 2, "name": "Servicios públicos" }, { "id": 3, "name": "Arriendo" }],
  "uncategorized": { "products": 3, "feedstock": 5, "packaging": 0 }
}
```

**`GET /api/reports/{reportKey}/export`** · `/api/reports/top-products/export?format=xlsx&from=2026-01-01&to=2026-09-30&metric=cop&top=3`

Respuesta binaria. Encabezados:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="reporte-top-products-2026-01-01_2026-09-30.xlsx"
```

Con `format=csv`: `Content-Type: text/csv; charset=UTF-8` y extensión `.csv`. El contenido es el mismo `data` con encabezados en español (specs §7.1).

**Error (cualquier endpoint)** · `?from=2026-09-30&to=2026-01-01`

```json
{ "success": false, "errorCode": "INVALID_REPORT_FILTER", "message": "La fecha inicial no puede ser posterior a la fecha final." }
```

#### Etapa 2

**`GET /api/reports/sales/profitability`** (R-2.2) · `?from=2026-01-01&to=2026-09-30&marginType=net&sort=desc&top=10`

Base: consulta 2.2. Ordenado por el margen elegido.

```jsonc
{
  "meta": { "report": "profitability", "dateField": "sales_order.file_date", "filters": { "from": "2026-01-01", "to": "2026-09-30", "marginType": "net", "sort": "desc", "top": 10, "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [
    { "code": "SALE_DATE_IS_UPLOAD_DATE", "message": "La fecha de venta corresponde a la fecha de carga del archivo. Si el archivo se subió tarde, las ventas pueden aparecer en otro período.", "count": null },
    { "code": "SALES_WITHOUT_COST", "message": "2 productos vendidos no tienen costo registrado; su utilidad aparece sobrestimada.", "count": 2 }
  ],
  "totals": {
    "netSales": 364660000, "materialCost": 210397700, "cifCost": 37496300, "commission": 18233000,
    "grossProfit": 154262300, "netProfit": 98533000, "grossMarginPct": 42.30, "netMarginPct": 27.02
  },
  "data": [
    { "productId": "fp-miel", "productName": "Miel orgánica 500 g", "lineName": "Alimentos", "categoryName": "Orgánico", "units": 1200, "kg": 600.000, "netSales": 38400000, "materialCost": 16896000, "cifCost": 3456000, "commission": 1920000, "grossProfit": 21504000, "netProfit": 16128000, "grossMarginPct": 56.00, "netMarginPct": 42.00, "linesWithoutCost": 0 },
    { "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g", "lineName": "Cosméticos", "categoryName": "Cremas / emulsiones", "units": 3900, "kg": 468.000, "netSales": 72150000, "materialCost": 30303000, "cifCost": 8658000, "commission": 3607500, "grossProfit": 41847000, "netProfit": 29581500, "grossMarginPct": 58.00, "netMarginPct": 41.00, "linesWithoutCost": 0 },
    // … 7 productos
    { "productId": "fp-chucrut", "productName": "Chucrut 450 g", "lineName": "Alimentos", "categoryName": "Fermento", "units": 900, "kg": 405.000, "netSales": 13050000, "materialCost": 11875500, "cifCost": 1305000, "commission": 652500, "grossProfit": 1174500, "netProfit": -783000, "grossMarginPct": 9.00, "netMarginPct": -6.00, "linesWithoutCost": 0 }
  ]
}
```

**`GET /api/reports/sales/profit-pareto`** (R-2.3) · `?from=2026-01-01&to=2026-09-30`

Base: consulta 2.3 (sobre el resultado de 2.2). El acumulado solo suma utilidades positivas.

```jsonc
{
  "meta": { "report": "profit-pareto", "dateField": "sales_order.file_date", "filters": { "from": "2026-01-01", "to": "2026-09-30", "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [ /* mismas que R-2.2 */ ],
  "totals": { "netProfit": 98533000, "productsTo80Pct": 5 },
  "data": [
    { "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g", "lineName": "Cosméticos", "netSales": 72150000, "netProfit": 29581500, "paretoCumulativePct": 29.79 },
    { "productId": "fp-granola", "productName": "Granola orgánica 400 g", "lineName": "Alimentos", "netSales": 48720000, "netProfit": 17539200, "paretoCumulativePct": 47.45 },
    { "productId": "fp-miel", "productName": "Miel orgánica 500 g", "lineName": "Alimentos", "netSales": 38400000, "netProfit": 16128000, "paretoCumulativePct": 63.68 },
    { "productId": "fp-jalea", "productName": "Jalea de mora 250 g", "lineName": "Alimentos", "netSales": 39900000, "netProfit": 13965000, "paretoCumulativePct": 77.75 },
    { "productId": "fp-kombucha", "productName": "Kombucha jengibre 500 ml", "lineName": "Alimentos", "netSales": 43920000, "netProfit": 8344800, "paretoCumulativePct": 86.15 },
    // … 4 productos
    { "productId": "fp-chucrut", "productName": "Chucrut 450 g", "lineName": "Alimentos", "netSales": 13050000, "netProfit": -783000, "paretoCumulativePct": 100.00 }
  ]
}
```

**`GET /api/reports/sales/volume-margin-matrix`** (R-2.4) · `?from=2026-01-01&to=2026-09-30&xAxis=kg&cut=median`

Base: consulta 2.4. Los cortes van en `totals`.

```jsonc
{
  "meta": { "report": "volume-margin-matrix", "dateField": "sales_order.file_date", "filters": { "from": "2026-01-01", "to": "2026-09-30", "xAxis": "kg", "cut": "median", "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [ /* mismas que R-2.2 */ ],
  "totals": { "xCut": 825.000, "yCut": 21.00, "products": 10 },
  "data": [
    { "productId": "fp-granola", "productName": "Granola orgánica 400 g", "lineName": "Alimentos", "x": 1160.000, "y": 36.00, "size": 17539200, "quadrant": "star" },
    { "productId": "fp-kombucha", "productName": "Kombucha jengibre 500 ml", "lineName": "Alimentos", "x": 3050.000, "y": 19.00, "size": 8344800, "quadrant": "fixed_cost_absorber" },
    { "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g", "lineName": "Cosméticos", "x": 468.000, "y": 41.00, "size": 29581500, "quadrant": "niche" },
    { "productId": "fp-chucrut", "productName": "Chucrut 450 g", "lineName": "Alimentos", "x": 405.000, "y": -6.00, "size": 783000, "quadrant": "parasite" }
    // … 6 productos
  ]
}
```

**`GET /api/reports/costing/waste`** (R-3.2) · `?from=2026-09-01&to=2026-09-30`

Base: consulta 3.2. `bulkLossKg` coincide con `lossKg` de R-1.3 para la misma orden.

```jsonc
{
  "meta": { "report": "waste", "dateField": "orders.date_closed", "filters": { "from": "2026-09-01", "to": "2026-09-30", "includeOutsideOrders": false }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [],
  "totals": { "bulkLossKg": 84.100, "bulkLossCop": 1034075, "extraFeedstockKg": 4.950, "extraFeedstockCop": 280000, "packagingLostUnits": 341, "packagingLostCop": 183000, "totalLossCop": 1497075 },
  "data": [
    { "orderId": 44, "batch": "L2609-044", "closedAt": "2026-09-24T16:40:00-05:00", "bulkLossKg": 28.000, "bulkLossCop": 307664, "extraFeedstockKg": 1.800, "extraFeedstockCop": 121000, "packagingLostUnits": 62, "packagingLostCop": 31000, "totalLossCop": 459664 },
    { "orderId": 39, "batch": "L2609-039", "closedAt": "2026-09-12T15:20:00-05:00", "bulkLossKg": 1.600, "bulkLossCop": 24971, "extraFeedstockKg": 0.000, "extraFeedstockCop": 0, "packagingLostUnits": 18, "packagingLostCop": 9000, "totalLossCop": 33971 }
    // … 4 órdenes
  ]
}
```

**`GET /api/reports/costing/waste/detail`** (R-3.2 detalle) · `?from=2026-09-01&to=2026-09-30&materialType=packaging&batch=L2609-044`

Lo que abre el clic sobre la fila de L2609-044. La suma cuadra con `packagingLostUnits` y `packagingLostCop` de esa fila.

```jsonc
{
  "meta": { "report": "waste-detail", "dateField": "packaging_kardex.date_created", "filters": { "from": "2026-09-01", "to": "2026-09-30", "materialType": "packaging", "batch": "L2609-044", "includeOutsideOrders": false }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [],
  "totals": { "quantity": 62, "cop": 31000 },
  "data": [
    { "orderId": 44, "batch": "L2609-044", "lineName": "Alimentos", "categoryName": "Envase", "materialName": "Botella PET 500 ml", "quantity": 40, "unit": "und", "cop": 20800 },
    { "orderId": 44, "batch": "L2609-044", "lineName": "Alimentos", "categoryName": "Tapa", "materialName": "Tapa rosca 28 mm", "quantity": 15, "unit": "und", "cop": 3450 },
    { "orderId": 44, "batch": "L2609-044", "lineName": "Alimentos", "categoryName": "Etiqueta", "materialName": "Etiqueta kombucha jengibre", "quantity": 7, "unit": "und", "cop": 6750 }
  ]
}
```

Con `materialType=feedstock`, `unit` es `"kg"` y `categoryName` sale del catálogo de materia prima. Con `includeOutsideOrders=true` aparecen filas con `orderId: null`, `batch` del material y `lineName: "Sin línea"`.

**`GET /api/reports/dashboard`** (R-G1) · `?from=2026-09-01&to=2026-09-30`

Base: consultas del tablero. `data` es un objeto; `meta.filters` informa también el período de comparación.

```jsonc
{
  "meta": { "report": "dashboard", "dateField": "varios", "filters": { "from": "2026-09-01", "to": "2026-09-30", "previousFrom": "2026-08-01", "previousTo": "2026-08-31", "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [ /* unión sin duplicados de las advertencias de R-1.1, R-2.1, R-2.2 y R-2.3 */ ],
  "totals": null,
  "data": {
    "production": { "ton": 5.980, "previousTon": 5.420, "variationPct": 10.33 },
    "netSales": { "value": 48200000, "previous": 47500000, "variationPct": 1.47 },
    "margin": { "netPct": 27.02, "grossPct": 42.30, "previousNetPct": 26.10, "variationPts": 0.92 },
    "topProducts": [
      { "productId": "fp-crema", "productName": "Crema hidratante aloe 120 g", "netProfit": 3902000 },
      { "productId": "fp-granola", "productName": "Granola orgánica 400 g", "netProfit": 2318000 },
      { "productId": "fp-miel", "productName": "Miel orgánica 500 g", "netProfit": 2131000 }
    ],
    "salesGoal": null                    // se llena en la Etapa 3
  }
}
```

La variación del margen va en puntos porcentuales (`variationPts`), no en %.

#### Etapa 3

**`GET /api/reports/costing/standard-vs-real`** (R-3.1) · `?from=2026-09-01&to=2026-09-30&thresholdPct=5`

Base: consulta 3.1.

```jsonc
{
  "meta": { "report": "standard-vs-real", "dateField": "orders.date_closed", "filters": { "from": "2026-09-01", "to": "2026-09-30", "thresholdPct": 5 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": ["No incluye mano de obra: solo materia prima y empaque."] },
  "warnings": [],
  "totals": { "orders": 6, "red": 1, "yellow": 2, "green": 3 },
  "data": [
    { "orderId": 44, "batch": "L2609-044", "closedAt": "2026-09-24T16:40:00-05:00", "mainProductName": "Kombucha jengibre 500 ml", "lineName": "Alimentos", "realKg": 472.000, "standardCost": 4720000, "realCost": 5186300, "standardCopKg": 10000, "realCopKg": 10988, "variationCopKg": 988, "deviationPct": 9.88, "status": "red", "topCause": { "materialName": "Jengibre fresco", "deviationCop": 412000 } },
    { "orderId": 41, "batch": "L2609-041", "closedAt": "2026-09-18T11:05:00-05:00", "mainProductName": "Jalea de mora 250 g", "lineName": "Alimentos", "realKg": 288.800, "standardCost": 4360000, "realCost": 4498200, "standardCopKg": 15097, "realCopKg": 15575, "variationCopKg": 479, "deviationPct": 3.17, "status": "yellow", "topCause": { "materialName": "Frasco vidrio 250 g", "deviationCop": 96500 } },
    { "orderId": 39, "batch": "L2609-039", "closedAt": "2026-09-12T15:20:00-05:00", "mainProductName": "Crema hidratante aloe 120 g", "lineName": "Cosméticos", "realKg": 198.400, "standardCost": 3120000, "realCost": 3096500, "standardCopKg": 15726, "realCopKg": 15607, "variationCopKg": -118, "deviationPct": -0.75, "status": "green", "topCause": null }
    // … 3 órdenes
  ]
}
```

**`GET /api/reports/costing/standard-vs-real/{orderId}/materials`** (R-3.1 detalle) · `/44/materials`

```jsonc
{
  "meta": { "report": "standard-vs-real-materials", "dateField": "orders.date_closed", "filters": { "orderId": 44 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [],
  "totals": { "standardCost": 4720000, "realCost": 5186300, "deviationCop": 466300 },
  "data": [
    { "materialType": "feedstock", "materialName": "Jengibre fresco", "standardQty": 22.000, "realQty": 23.800, "unit": "kg", "standardCost": 5038000, "realCost": 5450000, "deviationCop": 412000 },
    { "materialType": "packaging", "materialName": "Botella PET 500 ml", "standardQty": 944, "realQty": 944, "unit": "und", "standardCost": 490880, "realCost": 545180, "deviationCop": 54300 }
    // … resto de insumos, por |desviación| descendente
  ]
}
```

**`GET /api/reports/inventory/expiration`** (R-4.2) · `?from=2026-10-19&to=2027-01-17&subject=product`

Base: consulta 4.2b (producto terminado, saldo estimado). Con `subject=feedstock` (4.2a) el saldo es exacto, `balanceUnit: "kg"`, `estimated: false` y `lineName: null`.

```jsonc
{
  "meta": { "report": "expiration", "dateField": "kardex_final_product.expiration_date", "filters": { "from": "2026-10-19", "to": "2027-01-17", "subject": "product", "onlyWithBalance": true }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [
    { "code": "ESTIMATED_LOT_BALANCE", "message": "El saldo por lote de producto terminado es estimado (se asume que sale primero lo más antiguo).", "count": null }
  ],
  "totals": { "lots": 2, "valueAtRisk": 8537540 },
  "data": [
    { "subject": "product", "itemId": "fp-jalea", "itemName": "Jalea de mora 250 g", "lineName": "Alimentos", "categoryName": "Jaleas", "batch": "L2606-022", "expiresAt": "2026-10-28", "daysToExpire": 9, "balance": 310, "balanceUnit": "und", "valueAtRisk": 1207140, "estimated": true },
    { "subject": "product", "itemId": "fp-kefir", "itemName": "Kéfir de agua 1 L", "lineName": "Alimentos", "categoryName": "Fermento", "batch": "L2609-047", "expiresAt": "2026-12-01", "daysToExpire": 43, "balance": 880, "balanceUnit": "und", "valueAtRisk": 7330400, "estimated": true }
  ]
}
```

**`GET /api/reports/goals/progress`** (R-2.5) · `?year=2026&asOf=2026-09-30&metric=cop`

Base: consulta 2.5c. `linearTarget` es la meta prorrateada por días hasta el fin de cada mes.

```jsonc
{
  "meta": { "report": "goal-progress", "dateField": "sales_order.file_date", "filters": { "year": 2026, "asOf": "2026-09-30", "metric": "cop", "ivaPct": 0 }, "generatedAt": "2026-10-19T09:15:00-05:00", "notes": [] },
  "warnings": [ { "code": "SALE_DATE_IS_UPLOAD_DATE", "message": "…", "count": null } ],
  "totals": null,
  "data": {
    "goal": { "id": 7, "year": 2026, "metric": "cop", "target": 520000000, "scope": { "type": "global", "lotCategoryId": null, "productId": null } },
    "monthly": [
      { "month": 1, "value": 38200000, "cumulative": 38200000, "linearTarget": 44164384, "progressPct": 7.35 },
      { "month": 2, "value": 40100000, "cumulative": 78300000, "linearTarget": 84054795, "progressPct": 15.06 },
      // … marzo a agosto
      { "month": 9, "value": 48200000, "cumulative": 393000000, "linearTarget": 388931507, "progressPct": 75.58 }
    ],
    "kpi": { "cumulative": 393000000, "progressPct": 75.58, "expectedToDate": 388931507, "gap": 4068493, "projection": 525439560, "projectionPct": 101.05 }
  }
}
```

Sin meta para la combinación pedida → 404 `{ "success": false, "errorCode": "SALES_GOAL_NOT_FOUND", "message": "No hay meta definida para 2026 en pesos con alcance global." }`.

**Metas (CRUD).** No usan el sobre `ReportResult`.

`GET /api/reports/goals?year=2026` → `200`

```json
[
  { "id": 7, "year": 2026, "metric": "cop", "target": 520000000, "lotCategoryId": null, "lotCategoryName": null, "productId": null, "productName": null, "updatedBy": "Laura Gómez", "updatedAt": "2026-02-03T10:12:00-05:00" },
  { "id": 8, "year": 2026, "metric": "kg", "target": 70000, "lotCategoryId": "lc-alim", "lotCategoryName": "Alimentos", "productId": null, "productName": null, "updatedBy": "Laura Gómez", "updatedAt": "2026-02-03T10:15:00-05:00" }
]
```

`POST /api/reports/goals` con `{ "year": 2026, "metric": "cop", "target": 80000000, "lotCategoryId": "lc-cosm" }` → `201` con el mismo `SalesGoalDTO` (nuevo `id`). Duplicado → `409 { "success": false, "errorCode": "SALES_GOAL_ALREADY_EXISTS", "message": "Ya existe una meta para ese año, métrica y alcance." }`.

`PUT /api/reports/goals/7` con `{ "target": 540000000 }` → `200` con el `SalesGoalDTO` actualizado. `DELETE /api/reports/goals/7` → `204` sin cuerpo.

---

## 4. Migraciones Flyway (Etapa 1)

`ddl-auto` está en `validate`, así que **todo** cambio de esquema va por Flyway en `infrastructure/driven-adapters/jpa-repository/src/main/resources/db/migration/`.

### V10__reports_schema.sql

> En el repo ya existe `V9__product_cost_snapshot_used_cif.sql`. Antes de crear el archivo, confirmar que no haya otra V10 en `main`.

1. `CREATE SCHEMA IF NOT EXISTS reports;`
2. Vista `reports.v_sales_line_costed`, una fila por `sales_order_detail`, **solo con la valorización**:
   - `id_detail`, `id_sales_order`, `type`, `file_date`, `id_final_product`, `lot_category_id`, `category_id`, `quantity`, `kg_unit`, `kg`;
   - `charge_gross` (Total de Siigo, sin descontar IVA) y `list_price` (precio vigente en `file_date`, solo para remisiones; `NULL` si no hay).
   - Excluye `is_test_product`.
   - La lógica de precio vigente es la de la consulta 2.2 del informe de viabilidad.
   - Las columnas de costo (`commission_pct`, `mat_unit`, `cif_unit`, `cost_source`, `cif_incomplete`, `material_incomplete`) se agregan **al final** en la Etapa 2 (§10.2), con `CREATE OR REPLACE VIEW`.
3. Índices de apoyo de la Etapa 1 (§4.1), con `CREATE INDEX IF NOT EXISTS` y nombre explícito `ix_<tabla>_<columnas>`.
4. Permiso de *Informes* (M-4). Los módulos solo existen como datos en las bases actuales; ninguna migración los inserta. Por eso el `INSERT` va con `WHERE NOT EXISTS (… path = …)`:
   - `users.modules (name, module_group, submodule, path)`: `('Finanzas y administración', NULL, 'Informes', '/finanzas-y-administracion/informes')` (ya existe en desarrollo, id 29).
   - `users.privileges (id_role, id_module, read, write, update, delete)`: todo en `true` para el rol administrador, buscado por nombre (`users.roles.name = 'Admin'`), sin duplicar el par si ya existe.
   - Los usuarios ven el cambio al volver a iniciar sesión, porque el árbol de permisos viaja en el JWT.

> **Nota sobre la vista:** si más adelante se cambia la lógica de valorización o de costeo de ventas, se crea `V1x__…` con `CREATE OR REPLACE VIEW`. Nunca se edita una migración ya aplicada. PostgreSQL solo permite **agregar columnas al final** con `CREATE OR REPLACE VIEW`; quitar o reordenar columnas exige `DROP VIEW` + `CREATE VIEW`.

### 4.1 Índices

**Situación actual (revisado en V1–V9):** las migraciones no crean ningún índice secundario, solo claves primarias y restricciones `UNIQUE`. PostgreSQL no indexa las claves foráneas automáticamente, así que hoy toda unión por FK (`items.id_order`, `order_detail.id_order`, `sales_order_detail.id_sales_order`, …) y todo filtro por fecha recorre la tabla completa. Además, las columnas `id_order` de los tres kárdex no tienen FK ni índice. Ninguna entidad JPA declara `@Index`.

**Antes de escribir la migración**, confirmar en la base real que nadie creó índices a mano y medir volúmenes:

```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname IN ('inventory', 'costs') AND indexname NOT LIKE '%pkey'
ORDER BY 1, 2;

SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
WHERE schemaname IN ('inventory', 'costs')
ORDER BY n_live_tup DESC
LIMIT 15;
```

**Índices propuestos** (las consultas exactas se escriben en las Fases 2 y 3; los índices se ajustan con `EXPLAIN ANALYZE` en la tarea 8.3):

| # | Índice | Etapa | Lo usan | Motivo | Beneficio fuera de reportes |
|---|---|---|---|---|---|
| I-1 | `inventory.kardex_final_product (date_created) WHERE type = 'input' AND id_order IS NOT NULL` | 1 | R-1.1, R-1.2 (y R-G1 en la Etapa 2) | Rango de fechas sobre las entradas de producción; parcial para no indexar salidas ni movimientos sin orden. | — |
| I-2 | `inventory.kardex_final_product (id_order) WHERE id_order IS NOT NULL` | 1 | R-1.3 (kg producidos por orden) | Suma por orden. | `sumInputQuantityKgByOrderId` y `sumInputQuantityByOrderId`, que se usan al cerrar una orden. |
| I-3 | `inventory.feedstock_kardex (id_order) WHERE id_order IS NOT NULL` | 1 | R-1.1 con `subject=feedstock` (y R-3.2 en la Etapa 2) | Consumo y ajustes de materia prima por orden. | Filtro por orden del historial de movimientos. |
| I-5 | `inventory.items (id_order)` | 1 | R-1.1 feedstock (reparto de línea), R-1.3 | FK sin índice; une cada orden con sus productos. | Carga de ítems al abrir o cerrar una orden. |
| I-6 | `inventory.order_detail (id_order)` | 1 | R-1.3 (`extraFeedstockKg`) | FK sin índice. | Cada salida o ajuste de kárdex con orden actualiza `order_detail` por `id_order`. |
| I-7 | `inventory.orders (date_closed) WHERE classification = 'produccion' AND status = 'finalizada'` | 1 | R-1.3 (y R-3.2 en la Etapa 2) | Órdenes cerradas en el rango. | — |
| I-8 | `inventory.sales_order (file_date)` | 1 | R-2.1 (y R-2.2 a R-2.4, R-G1) | Rango de fechas de venta. | — |
| I-9 | `inventory.sales_order_detail (id_sales_order)` | 1 | Vista de ventas | FK sin índice; une la orden de venta con sus líneas. | Detalle de una orden de venta. |
| I-10 | `costs.product_cost_snapshot (id_final_product, date_snapshot DESC) WHERE snapshot_type = 'order_close'` | 1 | R-1.5 con filtro de producto (y la vista de ventas costeada en la Etapa 2) | En la Etapa 2 es la búsqueda que se repite por cada línea de venta (`LATERAL … ORDER BY date_snapshot DESC LIMIT 1`). | — |
| I-11 | `costs.product_cost_snapshot (date_snapshot) WHERE snapshot_type = 'order_close'` | 1 | R-1.5 | Rango de fechas sobre los cierres. | — |
| I-12 | `costs.product_cost_snapshot_cif_detail (id_snapshot)` | 1 | R-1.5 (CIF por tipo) | FK sin índice. | Detalle de un snapshot. |
| I-13 | `costs.product_price (id_final_product, effective_from DESC)` | 1 | Vista de ventas (precio vigente a la fecha de una remisión) | Búsqueda por producto y fecha que se repite por cada línea de remisión. | Precio vigente e historial de precios de un producto. |
| I-4 | `inventory.packaging_kardex (id_order) WHERE id_order IS NOT NULL` | 2 | R-3.2 | Empaque perdido por orden. | Filtro `orderId` de `PackagingKardexJpaRepository`. |

**Etapa 3:** `costs.product_cost_snapshot_material (id_snapshot)` (R-3.1; además acelera hoy el detalle de snapshot) y `costs.product_cost_snapshot (id_order)` (detalle de R-3.1; además acelera `findByIdOrder`). Si la revisión de 8.3 muestra que el detalle de snapshot ya es lento, se pueden adelantar.

**Descartados:**
- **Lote (`batch`):** el filtro es por coincidencia parcial (`ILIKE '%…%'`) y un índice B-tree no sirve para eso. Necesitaría `pg_trgm` + GIN; no se justifica porque el filtro siempre va junto con el rango de fechas, que ya acota las filas.
- **Línea y forma (`final_product.lot_category_id`, `category_id`; `feedstocks.category_id`; `packaging.category_id`):** son tablas de catálogo pequeñas; un recorrido completo es más rápido que un índice.
- **Ajustes de kárdex por fecha (`classification = 'ajuste'`):** son pocas filas y se llega a ellas por `id_order` (I-3, I-4), salvo con `includeOutsideOrders` (Etapa 2); si ese caso resulta lento, se agrega un índice parcial por `date_created`.

**Cómo se crean:**
- Van en V10 con `CREATE INDEX IF NOT EXISTS`, dentro de la transacción de Flyway. `CREATE INDEX` sin `CONCURRENTLY` bloquea las escrituras de la tabla mientras se construye; con los volúmenes esperados son segundos. Si la consulta de volúmenes muestra tablas de millones de filas, los índices se pasan a una migración aparte con `CONCURRENTLY` y la configuración por script de Flyway `executeInTransaction=false`.
- Después de crearlos, `ANALYZE` de las tablas tocadas para que el planificador use estadísticas al día.
- Cada índice agrega un costo pequeño a cada inserción en su tabla. Los kárdex son las tablas con más escrituras, por eso I-1 a I-4 son parciales.

---

## 5. Etapa 1: fases y tareas

- **5.A Back** (Fases 0, 1, 2, 3, 7 y 8): cada fase termina compilando, con `ArchitectureTest` en verde y los endpoints de la fase probados contra la base de desarrollo. Las Fases 4, 5 y 6 no existen en esta etapa (la numeración se conserva para las Etapas 2 y 3).
- **5.B Cambios a funcionalidades existentes** (back y front).
- **5.C Front** (Fases F-1 a F-4, F-7 y F-8).

### Fase 0: Datos y prerrequisitos (Naturex + desarrollo, en paralelo)

| # | Tarea | Hecho cuando |
|---|---|---|
| 0.1 | Completar `lot_category_id` y `category_id` en los productos que no los tienen, y la categoría de materias primas. (La de empaques se necesita en la Etapa 2, pero conviene hacerla ya.) | La consulta de control devuelve 0 filas "Sin línea / Sin forma", o el negocio acepta las que quedan. |
| 0.2 | Cerrar al menos un período CIF con kg producidos reales. | Los snapshots `order_close` nuevos salen con `cif_incomplete = false` (afecta a R-1.5). |
| 0.3 | Confirmar o aceptar los supuestos de D-1 (IVA en el Total de Siigo, afecta a R-2.1) y D-6 (cierre mensual de CIF, afecta a R-1.5). | Supuestos confirmados o ajustados en las specs. |

### Fase 1: Infraestructura base

| # | Tarea | Archivos | Hecho cuando |
|---|---|---|---|
| 1.1 | Migración V10 (esquema, vista de valorización, índices de la Etapa 1, permiso de *Informes*). | `V10__reports_schema.sql` | Flyway la aplica en una base limpia y en la de desarrollo; `SELECT * FROM reports.v_sales_line_costed LIMIT 10` funciona. |
| 1.2 | Modelo común: `ReportFilter`, `ReportResult`, `ReportMeta`, `ReportWarning`, `ReportWarningCode`, enums de la Etapa 1 y `InvalidReportFilterException`. | `model/report/**`, `model/exceptions/**` | Compila. |
| 1.3 | `ReportFilterValidator`: RG-01 (obligatorio, `from ≤ to`), RG-02 (≤ 731 días), rangos de `top` (1–100), `ivaPct` (0–100) y `minLossPct` (0–100). (`materialType` obligatorio se agrega en la Etapa 2; `thresholdPct` y `subject=packaging` en R-4.2, en la Etapa 3.) | `usecase/report/ReportFilterValidator.java` | Pruebas unitarias de cada regla (§6). |
| 1.4 | `ReportSqlBuilder`: `addIn(column, param, values)` con manejo del valor `none` → `column IS NULL`, `addEquals`, `addILike`, `addDateRange(column, from, to, isTimestamp)` (aplica `< to + 1 día`), `build()`. | `jpa/report/ReportSqlBuilder.java` | Pruebas unitarias del SQL y los parámetros generados. |
| 1.5 | DTOs comunes, `ReportFilterMapper` (parseo de listas `a,b,c` y enums sin distinguir mayúsculas; valor inválido → 400). | `api/dto/report/**`, `api/mapper/ReportFilterMapper.java` | — |
| 1.6 | Manejo de errores en `GlobalExceptionHandler`: `InvalidReportFilterException` → 400, con el formato actual `{success, errorCode, message}`. | `GlobalExceptionHandler.java` | Una petición sin `from` responde 400 con un mensaje claro. |
| 1.7 | `GET /api/reports/filters` (catálogos + `uncategorized`, B-3). | `ReportFiltersUseCase`, `ReportRest`, `ReportRepositoryAdapter` | El front carga los selectores en una sola llamada. |

### Fase 2: Producción (R-1.1, R-1.2, R-1.3, R-1.5)

| # | Tarea | Hecho cuando |
|---|---|---|
| 2.1 | R-1.1 `production/volume` con `subject=product`. | CA 1–4, 6 y 7 verificados contra la consulta manual. |
| 2.2 | R-1.1 con `subject=feedstock` (CTE de reparto de línea por orden). | CA 5: la suma de las partes es igual al total de la orden. |
| 2.3 | R-1.2 `production/comparison`: una consulta que trae ambos rangos, con `period_label` normalizado (mes 1–12 o semana ISO). Acumulados y variación en el use case. | CA 1–4. |
| 2.4 | R-1.3 `production/mass-balance`. | CA 1–6. |
| 2.5 | R-1.5 `production/cost-per-kg` + desglose de CIF por tipo (segunda consulta, unida en el use case por período). | CA 1–5; el log avisa si Σ CIF por tipo ≠ CIF total. |
| 2.6 | Advertencias del bloque: `UNCATEGORIZED_DATA`, `NO_PREVIOUS_YEAR_DATA`, `CIF_INCOMPLETE`, `MATERIAL_COST_INCOMPLETE`, `MULTI_PRODUCT_ORDER_COST`, con su conteo. | Cada una aparece en un rango de prueba que la provoca y no aparece en uno que no. |

### Fase 3: Ventas — top de productos (R-2.1)

| # | Tarea | Hecho cuando |
|---|---|---|
| 3.1 | Consulta base sobre `v_sales_line_costed` con venta neta: `CASE type WHEN 'ventas_siigo' THEN charge_gross/(1+:ivaPct/100) ELSE quantity*COALESCE(list_price,0) END`. Queda como fragmento reutilizable en `ReportQueries` para la Etapa 2. | — |
| 3.2 | R-2.1 `sales/top-products`. Los totales del período se calculan aparte del `LIMIT`. | CA 1–6. |
| 3.6 | Advertencias de ventas de la Etapa 1: `SALE_DATE_IS_UPLOAD_DATE` (siempre), `REMISSIONS_VALUED_AT_LIST_PRICE`, `REMISSIONS_WITHOUT_PRICE`, `UNCATEGORIZED_DATA`, con su conteo. (`SALES_WITHOUT_COST` y `CIF_INCOMPLETE` en ventas son de la Etapa 2.) | Aparecen con el conteo correcto en un rango con remisiones. |

### Fase 7: Exportación (R-G2, informes de la Etapa 1)

| # | Tarea | Hecho cuando |
|---|---|---|
| 7.1 | `ReportExportGateway` (modelo) + `ReportExportAdapter` (poi): XLSX con `SXSSFWorkbook`, hoja de datos con formatos numéricos y hoja "Filtros y advertencias"; CSV UTF-8 con BOM, separador `;`. | Los archivos abren bien en Excel en español. |
| 7.2 | `ReportExportUseCase`: según el `reportKey`, ejecuta el use case correspondiente con el mismo `ReportFilter`, define columnas y títulos en español y aplica el límite de 50 000 filas. Claves de la Etapa 1 (§3.1). | CA 1–6 de specs §7.1 para los 5 informes. |
| 7.3 | `GET /api/reports/{reportKey}/export`: responde `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` o `text/csv` con el nombre de archivo de la especificación. | Descarga desde el front con los filtros activos. |

### Fase 8: Calidad y entrega

| # | Tarea | Hecho cuando |
|---|---|---|
| 8.1 | Pruebas unitarias (ver §6). | `./gradlew test` en verde. |
| 8.2 | `ArchitectureTest` + `./gradlew jacocoTestReport` + `./gradlew pmdMain`. | Cobertura ≥ 80 % en `usecase/report`; sin violaciones PMD nuevas. |
| 8.3 | Prueba de rendimiento manual: 12 meses de datos, `EXPLAIN ANALYZE` de las consultas más pesadas de la etapa (R-1.1 feedstock, R-1.3, R-1.5, R-2.1). Confirmar que usan los índices de §4.1; quitar los que no se usen (`pg_stat_user_indexes.idx_scan = 0` tras la revisión funcional). | Todas < 3 s; índices ajustados si hace falta (nueva migración). |
| 8.4 | Documentación (M-8): en `CLAUDE.md` del back, `ddl-auto: validate` y `/api/reports` en las rutas base; contrato en `mcp/docs/api-context.md` si se quiere consultar desde el MCP. | — |
| 8.5 | Revisión funcional con Naturex usando la base de desarrollo con datos reales, **desde las pantallas del front** (Fase F-8). | Visto bueno de los 5 informes de la Etapa 1. |

### 5.B Cambios a funcionalidades existentes (back + front)

Corresponden a §11 de las specs. B-1, B-5 y B-6 son de la Etapa 3 (§11) porque dependen de D-5, D-7 y D-8.

| # | Cambio | Back | Front | Hecho cuando |
|---|---|---|---|---|
| ~~B-2~~ | **M-2 descartado** | — | Ya existe: el detalle del producto tiene la tarjeta *Categoria* con el diálogo "Cambiar Categoria" (`@core/components/inventory/category.tsx`). | — |
| B-3 | **M-3 Conteo de datos sin clasificar** | En `GET /api/reports/filters`, bloque `uncategorized` con productos activos (sin los de prueba), materias primas y empaques sin línea o forma. | Aviso en la barra de filtros con enlace al listado de inventario correspondiente. | El conteo coincide con la consulta de control de la tarea 0.1. |
| B-4 | **M-4 Permisos (solo *Informes*)** | Paso 4 de la migración V10; `@RequiresPermission(path = "/finanzas-y-administracion/informes")` en `ReportRest`. | `utils/constant/index.ts`: `ABILITY_FIELDS.INFORMES = "Informes"`. Chequeo: `ability.can(ABILITY_ACTIONS.READ, ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION, ABILITY_FIELDS.INFORMES)` (así arma `ability.ts` los submódulos: sujeto = módulo, campo = submódulo). *Metas de venta* va en la Etapa 3. | CA 1–2 de M-4 para *Informes*. |
| B-7 | **M-7 Aviso en CIF** | Sin cambio. | `views/pages/finanzas-y-administracion/cif/period/detail.tsx`: `<Alert severity='warning'>` si el período está abierto y su mes ya terminó. | El aviso aparece solo en períodos abiertos de meses vencidos. |
| B-8 | **Descarga con nombre de archivo** | `CorsConfig`: agregar `Content-Disposition` a los encabezados expuestos (`exposedHeaders`); sin esto el navegador no deja leer el nombre del archivo que envía el export. | — | El front lee el nombre del archivo en la descarga a través de ngrok. |
| B-9 | **M-8 Documentación** | Tarea 8.4. | `front-end/AGENTS.md`: ruta `/finanzas-y-administracion/informes`, dominio `reports/` en la capa de API, ApexCharts en el stack, `src/utils/reports/`. | Guías al día. |

### 5.C Fases del front

Repositorio `front-end/`, rama propia, commits separados del back. Cada fase termina con `pnpm lint`, `pnpm test:run` y `npx tsc --noEmit` en verde. El diseño de archivos está en §7.

#### Fase F-1: Base

| # | Tarea | Archivos | Hecho cuando |
|---|---|---|---|
| F-1.1 | Dependencias: `pnpm add apexcharts react-apexcharts`. Envoltorio con `next/dynamic` (`ssr: false`) y estilos del tema (tooltip, leyenda, ejes con las variables CSS de MUI, modo oscuro). | `package.json`, `src/libs/ApexCharts.tsx`, `src/libs/styles/AppReactApexCharts.tsx` | Un gráfico de prueba se ve bien en modo claro y oscuro y no rompe `pnpm build`. |
| F-1.2 | Tipos que espejan los DTOs del back: `ReportResult<T>`, `ReportMeta`, `ReportWarning`, `ReportWarningCode`, filas de los 5 informes de la Etapa 1, `ReportFiltersCatalog`. | `src/types/pages/reports.ts` | Los nombres de campo coinciden exactamente con el JSON (regla del `CLAUDE.md` raíz). |
| F-1.3 | Capa de API: lectura en servidor y descarga. | `src/api/reports/server.ts`, `index.ts` | Ver §7.3. |
| F-1.4 | Utilidades: parámetros de URL ↔ filtros (con valores por defecto y validación UI-12), formato `es-CO`, pivoteo de filas planas a series, color estable por línea. | `src/utils/reports/{params,format,pivot,colors}.ts` | Pruebas unitarias (§6.2). |
| F-1.5 | Registro de reportes (A-12) con los 5 informes de la Etapa 1: pestaña, `reportKey`, endpoint, filtros de la matriz §4.1, valores por defecto, rótulo de fecha, columnas y gráfico. | `src/utils/reports/registry.ts` | Prueba: **cada** entrada tiene filtro de fecha y sus filtros coinciden con la matriz. |
| F-1.6 | Ruta y permisos: página `informes` con pestañas por `?tab=` (*Producción* por defecto, *Ventas*); constante de B-4. | `src/app/(dashboard)/finanzas-y-administracion/informes/page.tsx`, `views/.../informes/tabs.tsx`, `utils/constant/index.ts` | La entrada aparece en el menú para el admin; un rol sin *Informes* no la ve (UI-04). |

#### Fase F-2: Componentes comunes

| # | Tarea | Hecho cuando |
|---|---|---|
| F-2.1 | `ReportFilterBar` dirigido por el registro: rango de fechas con atajos (UI-10, UI-11), selectores múltiples con búsqueda (UI-14), lote con espera de 500 ms (UI-15), conmutadores (`granularity`, `unit`, `metric`, etc.), "Limpiar filtros" (UI-17). Escribe en la URL con `router.replace()`. | Cambiar de reporte conserva los filtros compartidos y descarta los demás (UI-13). |
| F-2.2 | `ActiveFilterChips` (UI-18) y `UncategorizedNotice` (B-3). | Quitar una etiqueta quita el filtro de la URL. |
| F-2.3 | `ReportCard`: título, `ReportWarnings` (UI-21), gráfico, `ReportTable` (DataGrid con totales, UI-24) y `ExportButtons` (UI-30; solo XLSX y CSV). Estados de carga, vacío y error (UI-22). | Los tres estados se ven con datos simulados. |
| F-2.4 | Gráficos genéricos sobre ApexCharts que usa la Etapa 1: `StackedBarChart` (R-1.1; con línea de total para R-1.5), `LineComparisonChart` (R-1.2), `GroupedBarChart` (R-1.3), `HorizontalBarChart` (R-2.1). Formato de ejes y tooltip con `utils/reports/format.ts`. (`ParetoChart`, `BubbleMatrixChart` y `KpiCards` son de la Etapa 2.) | Cada uno acepta series ya pivoteadas y el `chartId` para exportar imagen. |
| F-2.5 | Exportación: XLSX/CSV con `exportReport` (blob + nombre de `Content-Disposition`). | Los dos archivos se descargan con el patrón de nombre de §7.1 de las specs. |

#### Fase F-3: Producción (depende de la Fase 2 del back)

| # | Tarea | Hecho cuando |
|---|---|---|
| F-3.1 | R-1.1 `VolumeReport` (conmutadores kg/ton y producto/materia prima; recarga el catálogo de forma al cambiar `subject`). | Las barras apiladas suman lo mismo que la fila de totales. |
| F-3.2 | R-1.2 `ComparisonReport`. | Variación `null` se muestra como "—", no como `Infinity`. |
| F-3.3 | R-1.3 `MassBalanceReport` con resaltado por `minLossPct`. | — |
| F-3.4 | R-1.5 `CostPerKgReport` (series de CIF por tipo + línea de total). | Conmutador COP/kg ↔ COP/ton. |

#### Fase F-4: Ventas — top de productos (depende de la Fase 3 del back)

| # | Tarea | Hecho cuando |
|---|---|---|
| F-4.1 | R-2.1 `TopProductsReport`: conmutador de métrica (unidades / kg / $), selector de *Top N*, filtro de origen. Campo `ivaPct` solo visible si el negocio lo pide (D-1); mientras tanto, oculto con valor 0. | Barras coloreadas por línea con el color estable de `colors.ts`; los totales cubren todo el período, no solo el top. |

#### Fase F-7: Cambios en pantallas existentes

| # | Tarea | Hecho cuando |
|---|---|---|
| F-7.1 | Front de B-7 (aviso en CIF). | Ver criterios de §5.B. |

#### Fase F-8: Calidad y entrega

| # | Tarea | Hecho cuando |
|---|---|---|
| F-8.1 | Pruebas unitarias del front (§6.2). | `pnpm test:run` en verde. |
| F-8.2 | Revisión visual en 1440 px, 1024 px y 390 px; modo claro y oscuro (UI-26, UI-27). | Sin desplazamiento horizontal de página. |
| F-8.3 | `pnpm build` y `pnpm doctor`; revisar que ApexCharts solo se cargue en la página de informes (importación dinámica). | Build sin errores; el paquete de las demás páginas no crece. |
| F-8.4 | Documentación (B-9). | — |

---

## 6. Pruebas (Etapa 1)

### 6.1 Back

`domain/usecase/src/test` ya tiene `KardexFeedstockUseCaseTest` y `MinimumStockAlertUseCaseTest`; las pruebas nuevas siguen ese estilo (JUnit 5 + Mockito) en `usecase/report/`.

| Nivel | Qué se prueba | Cómo |
|---|---|---|
| Unitario: validador | RG-01 (sin `from`, sin `to`, `from > to`), RG-02 (732 días), `top` 0 y 101, `ivaPct` −1 y 101, `minLossPct` fuera de rango, `reportKey` desconocido o de una etapa no implementada en exportación. | JUnit 5, sin mocks. |
| Unitario: use cases | Acumulados y variación de R-1.2 (incluido `previous = 0` y rango sin año anterior), unión de filas de costo y CIF por tipo en R-1.5, totales de R-2.1 independientes del `top`, emisión y conteo de advertencias. | `ReportRepository` simulado con Mockito y filas armadas a mano. |
| Unitario: SQL builder | Que cada filtro genere el fragmento y el parámetro correctos; que `none` genere `IS NULL`; que la fecha final sea exclusiva + 1 día en los timestamps. | JUnit 5. |
| Integración: consultas | Cada consulta de `ReportQueries` contra PostgreSQL real, con un conjunto mínimo de datos (2 líneas, 3 productos, 1 de prueba, 1 orden cancelada, 1 orden multiproducto, 1 remisión sin precio). | **Recomendado:** Testcontainers PostgreSQL 14 (nueva dependencia de prueba en `jpa-repository`). **Mínimo:** script SQL de datos semilla y verificación manual contra la base de desarrollo. H2 no sirve: las consultas usan `LATERAL`, `DISTINCT ON` y `date_trunc`. |
| Arquitectura | `ArchitectureTest` existente. | `./gradlew :app-service:test --tests "co.com.naturex.ArchitectureTest"` |

**Casos de datos que deben cubrir las pruebas de integración:**

- el producto de prueba nunca aparece;
- la orden cancelada no suma;
- la orden multiproducto reparte la línea de la materia prima (R-1.1 feedstock) y genera `MULTI_PRODUCT_ORDER_COST` en R-1.5;
- la remisión sin precio suma $0 y genera `REMISSIONS_WITHOUT_PRICE`;
- el producto sin línea aparece como "Sin línea" y con el filtro `none`;
- el filtro de fecha excluye el día siguiente a `to` (timestamp 23:59:59 incluido, 00:00:00 del día siguiente excluido).

### 6.2 Front

Vitest + Testing Library, en carpetas `__tests__/` junto al código (convención de `AGENTS.md`).

| Qué se prueba | Casos mínimos |
|---|---|
| `registry.ts` | **Toda** entrada incluye `dateRange` en `filters`; los filtros de cada reporte coinciden con la matriz §4.1; ninguna entrada expone `clientIds`; las claves coinciden con los `reportKey` de la Etapa 1 del back. |
| `params.ts` | Valores por defecto por reporte (mes en curso); ida y vuelta URL → filtros → URL sin pérdida; listas `a,b,c`; valor `none`; `from > to` y 732 días rechazados con el mismo mensaje del back; al cambiar de reporte se descartan los filtros no admitidos. |
| `format.ts` | COP sin decimales con separador de miles `.`; kg con 3 decimales y coma; `null` → "—"; abreviado (`$1,2 M`). |
| `pivot.ts` | Filas de R-1.1 apiladas por línea y por forma suman lo mismo; períodos sin datos no se rellenan con 0 (CA 7 de R-1.1). |
| `colors.ts` | La misma línea recibe el mismo color en dos llamadas y con distinto orden de filas. |
| `ReportWarnings` | Muestra un aviso por advertencia; `SALE_DATE_IS_UPLOAD_DATE` como *info*; `CIF_INCOMPLETE` con enlace a CIF. |
| `ReportCard` | Estados de carga, vacío y error (UI-22). |

Verificación de cierre: `pnpm lint`, `pnpm test:run`, `npx tsc --noEmit` y `pnpm build`.

---

## 7. Diseño del front

### 7.1 Estructura de archivos (Etapa 1)

```
front-end/src/
├── app/(dashboard)/finanzas-y-administracion/informes/
│   └── page.tsx                          // página síncrona: lee searchParams, <Tabs/>, <ReportFilterBar/>, <Suspense key=…> + DataFetcher async
├── api/reports/
│   ├── server.ts                         // getReportServer, getReportFiltersServer
│   └── index.ts                          // cliente (axios): exportReport (blob)
├── libs/
│   ├── ApexCharts.tsx                    // next/dynamic(() => import("react-apexcharts"), { ssr: false })
│   └── styles/AppReactApexCharts.tsx     // estilos del tema MUI para tooltip, leyenda y ejes
├── types/pages/reports.ts                // espejo de los DTOs (F-1.2)
├── utils/
│   ├── reports/
│   │   ├── registry.ts                   // A-12: un objeto por reportKey
│   │   ├── params.ts                     // searchParams ↔ ReportFilters, defaults, validación UI-12, serialización para la API
│   │   ├── format.ts                     // Intl.NumberFormat("es-CO"): cop, kg, ton, pct, abreviado
│   │   ├── pivot.ts                      // filas planas → { categories, series } para ApexCharts
│   │   └── colors.ts                     // color estable por lineId (paleta del tema)
│   ├── columns/reports.tsx               // columnas DataGrid por reporte (son hooks: invocarlas en el cuerpo del componente)
│   └── constant/index.ts                 // ABILITY_FIELDS.INFORMES
└── views/pages/finanzas-y-administracion/informes/
    ├── tabs.tsx                          // Producción | Ventas (Etapa 2 agrega Tablero y Costeo; Etapa 3, Meta anual e Inventario)
    ├── ReportSelector.tsx                // reporte dentro de la pestaña (?report=)
    ├── filters/
    │   ├── ReportFilterBar.tsx
    │   ├── DateRangeFilter.tsx           // CustomDatePicker ×2 + atajos
    │   ├── MultiSelectFilter.tsx         // CustomAutocomplete multiple
    │   ├── ActiveFilterChips.tsx
    │   └── UncategorizedNotice.tsx
    ├── shared/
    │   ├── ReportCard.tsx
    │   ├── ReportWarnings.tsx
    │   ├── ReportTable.tsx
    │   ├── ExportButtons.tsx
    │   └── EmptyState.tsx
    ├── charts/                           // StackedBar, LineComparison, GroupedBar, HorizontalBar
    ├── produccion/                       // VolumeReport, ComparisonReport, MassBalanceReport, CostPerKgReport
    └── ventas/                           // TopProductsReport
```

Los archivos de la Etapa 2 están en §10.4 y los de la Etapa 3 en §11.4.

### 7.2 Flujo de una consulta

1. `page.tsx` recibe `searchParams`, resuelve `tab` y `report` (por defecto el primero de la pestaña) y busca la entrada en `registry.ts`.
2. `params.ts` convierte `searchParams` en `ReportFilters` aplicando los valores por defecto del reporte (UI-11). Si la validación local falla (UI-12), se muestra el aviso y **no** se llama a la API.
3. Un `async DataFetcher` dentro de `<Suspense key={query}>` llama a `getReportServer(entry.endpoint, filters)`. El `key` hace que el `Suspense` muestre el indicador de carga en cada cambio de filtros.
4. El componente del reporte (cliente) recibe `ReportResult<T>`, pivotea con `pivot.ts` y dibuja `ReportCard`.
5. La barra de filtros (cliente) solo escribe en la URL con `router.replace()`; no guarda estado propio salvo el texto de lote mientras se escribe.

Los catálogos de `/api/reports/filters` se leen en el servidor una vez por pestaña (`tags: ["reports-filters"]`) y se pasan a la barra de filtros.

### 7.3 Capa de API

| Archivo | Función | Detalle |
|---|---|---|
| `server.ts` | `getReportServer<T>(path, filters)` | `apiFetch<ReportResult<T>>("reports/" + path + "?" + toQuery(filters), { tags: ["reports"] })`. A diferencia de los demás `server.ts`, **no** devuelve `null` en error: devuelve `{ data: null, error: message }` para que la tarjeta muestre el mensaje de la API (UI-22). |
| `server.ts` | `getReportFiltersServer(subject)` | Mismo patrón. |
| `index.ts` | `exportReport(reportKey, filters, format)` | `API().get("/reports/" + reportKey + "/export", { params, responseType: "blob" })`. El nombre sale de `Content-Disposition` (requiere B-8); si no se puede leer, se arma con el patrón de §7.1 de las specs. Si la respuesta es un error, el `blob` se lee como texto y se muestra su `message`. |

**Caché:** `apiFetch` llama a `getServerSession`, que lee cookies; eso vuelve la ruta dinámica, y Next 14 no guarda en caché un `fetch` con encabezado `Authorization` en una ruta dinámica. Verificar en F-1.3 que dos consultas seguidas con los mismos filtros traen datos frescos después de cargar ventas; si no, agregar una opción `cache` a `apiFetch` y usar `"no-store"` en reportes.

**Tiempo de espera:** `apiFetch` corta a los 15 s. Las consultas deben responder en < 3 s (RG-15), así que alcanza. La exportación va por axios (sin ese límite).

### 7.4 Registro de reportes (forma de cada entrada)

```ts
type ReportEntry = {
  key: ReportKey;                    // "production-volume", ... (mismo valor que el reportKey del back)
  tab: "produccion" | "ventas";      // Etapa 2 agrega "tablero" y "costeo"; Etapa 3, "meta" e "inventario"
  label: string;                     // "Kg / ton producidas"
  endpoint: string;                  // "production/volume"
  dateLabel: string;                 // "Fecha de ingreso a inventario" (UI-10)
  filters: FilterKey[];              // siempre incluye "dateRange"; el resto según la matriz §4.1
  defaults: Partial<ReportFilters>;  // granularity: "month", top: 10, ...
  exportable: boolean;               // false solo en el tablero (Etapa 2)
};
```

---

## 8. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| CIF en 0 (un solo período cerrado, sin kg) | Costo por kg sin indirectos en R-1.5 (y márgenes netos inflados en la Etapa 2). | Tarea 0.2 + advertencia `CIF_INCOMPLETE` siempre visible + aviso en CIF (B-7). |
| Fecha de venta = fecha de carga | Ventas en el período equivocado en R-2.1. | Advertencia `SALE_DATE_IS_UPLOAD_DATE` siempre visible; B-1 en la Etapa 3 (D-5). |
| Productos sin línea o forma | Barras grandes de "Sin línea" que confunden. | Tarea 0.1 (desde el detalle de producto ya existente), conteo visible (B-3) y advertencia `UNCATEGORIZED_DATA`. |
| Snapshot asociado solo al producto principal en órdenes multiproducto | Costo por producto impreciso en R-1.5 (y en R-2.2 en la Etapa 2). | Advertencia `MULTI_PRODUCT_ORDER_COST`. Mejora futura: costo por ítem al cerrar la orden (fuera de alcance). |
| Consultas lentas con volumen | Tiempos > 3 s. | Índices de §4.1, rango máximo de 731 días, `EXPLAIN ANALYZE` en la Fase 8. |
| La vista de la Etapa 1 cambia en la Etapa 2 | Romper R-2.1 al agregar el costeo. | La Etapa 2 solo **agrega** columnas al final (`CREATE OR REPLACE VIEW`); las de la Etapa 1 no cambian de nombre, tipo ni lógica. Las pruebas de integración de R-2.1 se vuelven a correr en la Etapa 2. |
| Cambios futuros en las fórmulas de costeo | La vista queda desalineada. | La vista solo lee columnas del snapshot; no recalcula. Cualquier cambio de fórmula se revisa con la skill `costs-module` y se actualiza la vista con una nueva migración. |
| IVA en el Total de Siigo sin confirmar | Ventas infladas en R-2.1 (y márgenes en la Etapa 2). | Parámetro `ivaPct` (por defecto 0) y decisión D-1 en la Fase 0. |
| Choque de número de migración | Flyway falla al arrancar si otra rama agrega una V10. | Confirmar el siguiente número libre en `main` justo antes de abrir el PR. |
| Permisos nuevos no visibles | Los usuarios no ven *Informes* después del despliegue. | El árbol viaja en el JWT: pedir cerrar sesión y volver a entrar; asignar el submódulo a los roles desde la pantalla de roles. |
| DTO y tipos del front desalineados | Gráficos vacíos o `undefined` sin error visible. | `types/pages/reports.ts` se escribe a partir de los DTOs ya publicados; la revisión de las fases F-3 y F-4 compara contra la respuesta real de la API. |
| Peso de ApexCharts | Páginas más lentas en todo el sitio. | Importación dinámica solo en la página de informes (F-8.3). |
| Descarga sin nombre de archivo a través de ngrok | El navegador guarda el archivo con nombre genérico. | B-8 (exponer `Content-Disposition`) y nombre armado en el front como respaldo. |

---

## 9. Orden sugerido y dependencias (Etapa 1)

```
BACK                                                             FRONT
Fase 0 (datos + supuestos D-1, D-6) ────────────────┐
Fase 1 (base + V10 + permiso Informes) ─┬───────────────────────── F-1 (base) ── F-2 (componentes comunes)
                                        ├─ Fase 2 (producción) ──────────────── F-3 (producción)
                                        ├─ Fase 3 (top de productos) ────────── F-4 (top de productos)
                                        └─ Fase 7 (exportación) + B-8 ───────── F-2.5 (descargas)
§5.B (B-3, B-4, B-7, B-8, B-9) ──────────────────────────────────── F-7 (aviso en CIF)
Fase 8 (calidad back) ───────────────────────────────────────────── F-8 (calidad front) ── 8.5 revisión con Naturex
```

- Las Fases 2 y 3 del back son independientes entre sí después de la Fase 1, y se pueden repartir. La Fase 7 necesita al menos un informe terminado para probarse de punta a punta.
- F-1 y F-2 pueden empezar en paralelo con la Fase 1 del back usando respuestas simuladas que respeten el contrato de specs §6; F-3 y F-4 se cierran contra la API real.
- Ningún trabajo de la Etapa 1 depende de una decisión pendiente: D-1 y D-6 tienen supuestos por defecto.
- Back y front se entregan en ramas y commits separados, cada uno en su repositorio.
- La Etapa 2 empieza cuando la 8.5 tenga el visto bueno de Naturex.

---

## 10. Etapa 2: rentabilidad, mermas y tablero

Informes: R-2.2, R-2.3, R-2.4, R-3.2 y R-G1 con 4 tarjetas. Ninguno espera una decisión: D-1 y D-6 siguen con su supuesto. Reutiliza todo lo de la Etapa 1 (contrato, validador, `ReportSqlBuilder`, vista de ventas, barra de filtros, registro de reportes y exportación).

### 10.1 Prerrequisitos

- Etapa 1 aprobada por Naturex (tarea 8.5).
- Tarea 0.1 completa también para empaques (la forma del empaque se usa en el detalle de R-3.2).
- Revisión con la skill `costs-module` de la regla de costeo por línea de venta (specs §2 y CA 1 de R-2.2) antes de escribir la vista.

### 10.2 Migración `V1x__reports_sales_cost.sql`

Siguiente número libre en `main` al momento de hacerla.

1. `CREATE OR REPLACE VIEW reports.v_sales_line_costed` con las mismas columnas de la Etapa 1, en el mismo orden, y **al final**:
   - `commission_pct` (del precio vigente en `file_date`);
   - `mat_unit` y `cif_unit` (del último snapshot `order_close` del producto con fecha ≤ `file_date`; si no hay, del snapshot vinculado al precio vigente);
   - `cost_source` (`order_close` / `price_snapshot` / `none`), `cif_incomplete`, `material_incomplete`.
2. Índice I-4 (§4.1).
3. `ANALYZE` de las tablas tocadas.

### 10.3 Back

| # | Tarea | Hecho cuando |
|---|---|---|
| 3.3 | R-2.2 `sales/profitability`. | CA 1–6; margen bruto y neto coinciden con el cálculo manual de 3 productos de muestra. |
| 3.4 | R-2.3 `sales/profit-pareto` (Pareto calculado en el use case sobre el resultado de 3.3). | CA 1–3. |
| 3.5 | R-2.4 `sales/volume-margin-matrix`: medianas y cuadrantes en el use case; `cut=target` lee `target_margin_pct` o `default_margin_pct`. | CA 1–3. |
| 3.8 | Advertencias de ventas costeadas: `SALES_WITHOUT_COST`, `CIF_INCOMPLETE`, `MATERIAL_COST_INCOMPLETE`, con su conteo. | Aparecen en un rango con productos vendidos sin cierre ni snapshot de precio. |
| 5.3 | R-3.2 `costing/waste` (granel + materia prima + empaque por orden). | CA 1–3 y 5. |
| 5.4 | R-3.2 `costing/waste/detail` por `materialType`, con la forma del material y la línea repartida por orden; `includeOutsideOrders`. Validador: `materialType` obligatorio en el detalle. | CA 4 y 5. |
| 6.1 | `DashboardUseCase`: 4 tarjetas (toneladas, facturación neta, margen neto y bruto global, top 3 por utilidad). Llama a los use cases de producción y ventas con el período pedido y el período anterior de igual duración; une las advertencias sin duplicar. | CA 1–4 de R-G1; una sola respuesta en < 3 s. |
| 7.4 | Exportación: agregar `profitability`, `profit-pareto`, `volume-margin-matrix`, `waste` y `waste-detail` a `ReportExportUseCase`. | CA de specs §7.1 para los cinco. |
| 8.6 | Pruebas: Pareto (solo positivas, termina en 100 %), medianas con cantidad par e impar, cuadrantes en los bordes, variación del tablero frente al período anterior de igual duración, unión de advertencias; integración con una venta sin costo y una venta con cierre posterior a la fecha de venta (debe tomar el anterior). R-2.1 se vuelve a probar sobre la vista nueva. `EXPLAIN ANALYZE` de R-2.2, R-3.2 y el tablero. | `./gradlew test` en verde; todas < 3 s. |

### 10.4 Front

| # | Tarea | Hecho cuando |
|---|---|---|
| F-2.6 | Gráficos: `ParetoChart` (eje secundario), `BubbleMatrixChart` (anotaciones de corte y cuadrantes), `KpiCards` (sobre `MetricCardGroup`). | Mismos criterios que F-2.4. |
| F-4.2 | R-2.2 a R-2.4: `ProfitabilityReport`, `ParetoReport`, `VolumeMarginMatrixReport` en la pestaña *Ventas*. | Cuadrantes y colores según specs §10.4. |
| F-5.2 | Pestaña *Costeo*: R-3.2 `WasteReport` con pestañas de detalle por tipo de material (lectura en cliente con `getWasteDetail`). | La suma del detalle coincide con la fila del lote. |
| F-6.1 | Pestaña *Tablero* (pasa a ser la pestaña por defecto): `DashboardCards` con las 4 tarjetas, variación con flecha y color, enlace de cada tarjeta a su reporte con los mismos filtros. `getDashboardServer` en `server.ts`. | Cada cifra coincide con su reporte de origen. |
| F-8.5 | Tipos de las filas nuevas y `DashboardKpis`; entradas nuevas en `registry.ts`; pruebas del registro actualizadas. | `pnpm lint`, `pnpm test:run`, `npx tsc --noEmit` y `pnpm build` en verde. |

Archivos del front que agrega la Etapa 2: `charts/{Pareto,BubbleMatrix,KpiCards}`, `ventas/{ProfitabilityReport,ParetoReport,VolumeMarginMatrixReport}.tsx`, `costeo/WasteReport.tsx`, `tablero/DashboardCards.tsx` y `getWasteDetail` en `api/reports/index.ts`.

---

## 11. Etapa 3: pendiente por decisiones

Se planifica cuando las decisiones de la tabla 11.1 estén respondidas. Se suma sobre lo de las Etapas 1 y 2 sin rediseño.

### 11.1 Qué entra y qué lo bloquea

| Ítem | Qué falta decidir (specs §9) |
|---|---|
| R-2.5 Meta anual + tarjeta de meta en R-G1 + permiso *Metas de venta* | D-2 (meta con o sin IVA), D-3 (remisiones en la meta), D-4 (metas mensuales). |
| R-3.1 Costo estándar vs real | D-9 (¿se acepta el semáforo solo con materiales y empaque, sin mano de obra?). |
| R-4.2 Vencimientos FEFO | D-10 (¿se acepta el saldo estimado por lote de producto terminado?). |
| R-G3 PDF por reporte y consolidado | D-11 (¿PDF generado en el navegador es suficiente?). |
| M-1 Fecha de venta al cargar | D-5. |
| M-5 Retiro de *Soporte › Reportes* | D-7. |
| M-6 Tablero en la página de inicio | D-8. |

### 11.2 Back

| # | Tarea | Hecho cuando |
|---|---|---|
| 4.1 | `SalesGoalEntity` / `JpaRepository` / `Mapper` / `RepositoryAdapter` sobre `reports.sales_goal`. | `ddl-auto: validate` arranca sin errores. |
| 4.2 | `SalesGoalUseCase`: crear (valida alcance excluyente, `target > 0`, año, duplicado → 409), actualizar solo el `target`, eliminar, listar por año. | Pruebas unitarias de las validaciones. |
| 4.3 | Avance: valores mensuales desde la vista (misma venta neta que la Fase 3) + KPIs (`expectedToDate`, `gap`, `projection`) calculados en el use case con `asOf`. | Los CA 1–6 y las fórmulas coinciden con un cálculo manual (año bisiesto incluido). |
| 4.4 | `SalesGoalRest` con permisos diferenciados para consultar y para gestionar (tabla abajo). | Un usuario sin crear en `/finanzas-y-administracion/informes/metas` recibe 403 al crear. |
| 5.1 | R-3.1 `costing/standard-vs-real`: semáforo calculado en el use case con `thresholdPct`; `topCause` obtenido con `DISTINCT ON` sobre `product_cost_snapshot_material`. | CA 1–5; `meta.notes` informa que no incluye mano de obra. |
| 5.2 | Detalle `/{orderId}/materials`. | Ordenado por \|desviación\|; 404 si la orden no tiene snapshot `order_close`. |
| 5.5 | R-4.2 `inventory/expiration`: materia prima (saldo exacto por lote, valor al costo promedio actual) y producto terminado (saldo estimado FIFO desde `product_history`, valor al último snapshot). | CA 1–5. |
| 6.2 | Tarjeta de meta anual en `DashboardUseCase` (CA 5 de R-G1). | La tarjeta muestra `null` y "Sin meta definida" si no hay meta global en COP. |
| 3.7 | *(Opcional, si se aprueba D-5)* Fecha de venta al cargar: ver tarea **B-1** (§11.4). Si se hace, `SALE_DATE_IS_UPLOAD_DATE` se emite solo cuando alguna fila del resultado tiene `sale_date_provided = false`. | Advertencia condicionada y probada con un rango mixto. |
| E3-V | `ReportFilterValidator`: `thresholdPct` (0–100) y `subject=packaging` prohibido en R-4.2. `GlobalExceptionHandler`: `SalesGoalNotFoundException` → 404, `SalesGoalAlreadyExistsException` → 409. | Pruebas unitarias. |
| E3-E | Exportación: agregar `goal-progress`, `standard-vs-real` y `expiration` a `ReportExportUseCase`. | CA de specs §7.1 para los tres. |

Endpoints de metas (`SalesGoalRest`):

| Método y ruta | Permiso | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| `GET /api/reports/goals?year=` | `/finanzas-y-administracion/informes` GET | — | `SalesGoalDTO[]` |
| `POST /api/reports/goals` | `/finanzas-y-administracion/informes/metas` POST | `{ year, metric, target, lotCategoryId?, productId? }` | `SalesGoalDTO` (201) |
| `PUT /api/reports/goals/{id}` | `/finanzas-y-administracion/informes/metas` PUT | `{ target }` (el alcance no se edita) | `SalesGoalDTO` |
| `DELETE /api/reports/goals/{id}` | `/finanzas-y-administracion/informes/metas` DELETE | — | 204 |
| `GET /api/reports/goals/progress` | `/finanzas-y-administracion/informes` GET | `year` (obligatorio), `asOf`, `metric`, `lotCategoryId`, `productId`, `ivaPct`, `origin` | `ReportResult<SalesGoalProgress>` |

El usuario se toma con `@CurrentUserId` y del token, como en `CifRest` (`extractId` / `extractName`).

### 11.3 Migraciones de la Etapa 3

Se numeran con el siguiente número libre en `main` al momento de hacerlas (`V1x`).

- **Metas:** tabla `reports.sales_goal` (columnas `id`, `year`, `metric` con `CHECK` en cop/kg/units, `target > 0`, `id_lot_category` FK, `id_final_product` FK, `id_user`, `name_user`, `date_created`, `date_updated`; `CHECK (id_lot_category IS NULL OR id_final_product IS NULL)`; índice único `(year, metric, COALESCE(id_lot_category,''), COALESCE(id_final_product,''))`, porque PostgreSQL 14 no tiene `NULLS NOT DISTINCT`) + submódulo `('Finanzas y administración', NULL, 'Metas de venta', '/finanzas-y-administracion/informes/metas')` con privilegios para el rol administrador (mismo patrón `WHERE NOT EXISTS` que V10). *Metas de venta* aparecerá en el menú como una entrada más; si se prefiere ocultarla, el front la filtra en `VerticalMenu` por path.
- **Fecha de venta (D-5):** `ALTER TABLE inventory.sales_order ADD COLUMN sale_date_provided boolean NOT NULL DEFAULT false;` y `CREATE OR REPLACE VIEW reports.v_sales_line_costed` agregando `sale_date_provided` **al final** de las columnas, después de las de la Etapa 2.
- **Retiro de *Soporte › Reportes* (D-7):** `DELETE FROM users.privileges` y `DELETE FROM users.modules` donde `path = '/soporte/reportes'`.
- **Índices:** los de la Etapa 3 listados en §4.1.

### 11.4 Cambios existentes y front

| # | Cambio | Back | Front | Hecho cuando |
|---|---|---|---|---|
| B-1 | **M-1 Fecha de venta** *(opcional, D-5)* | `SalesOrderRest`: `@RequestParam(name = "saleDate", required = false) @DateTimeFormat(iso = DATE) LocalDate saleDate` en `/file/remision-venta` y `/file/ventas-siigo`. `SalesOrderUseCase` (hoy `.fileDate(LocalDate.now())`, línea ~91): valida que no sea futura ni de más de 365 días atrás (`InvalidSaleDateException` → 400 en `GlobalExceptionHandler`), guarda `fileDate = saleDate ?? hoy` y `saleDateProvided = saleDate != null`. Campo nuevo en `SalesOrder` (modelo), entidad JPA y DTO de respuesta. Migración de fecha de venta (§11.3). | `ordenes-de-venta/create.tsx`: campo `saleDate` en el esquema yup (no futura, no mayor a 1 año atrás) con hoy por defecto. `form.tsx`: `CustomDatePicker`. `api/order/index.ts`: `formData.append("saleDate", moment(d).format("YYYY-MM-DD"))` en las dos cargas. `types/pages/saleOrder.ts`: `saleDateProvided?: boolean`. Listado y detalle: rotular la columna como "Fecha de venta" e indicar "(fecha de carga)" cuando `saleDateProvided` es falso. | CA 1–5 de M-1. Carga sin fecha: mismo resultado que hoy. |
| B-5 | **M-5 Retiro de *Soporte › Reportes*** *(opcional, D-7)* | Migración de retiro (§11.3). | `app/(dashboard)/soporte/reportes/page.tsx` → `redirect("/finanzas-y-administracion/informes")` de `next/navigation`. | El menú ya no lo muestra; la ruta vieja redirige. |
| B-6 | **M-6 Tablero en inicio** *(D-8)* | Sin cambio. | `app/(dashboard)/home/page.tsx`: si la sesión tiene lectura sobre *Informes* (o rol admin), renderiza `DashboardCards` (mismo componente de la pestaña Tablero) con el mes en curso dentro de `Suspense`; si no, la bienvenida actual sin llamar a la API. El chequeo en servidor recorre `session.permissions` con el mismo criterio que `ability.ts`. | CA 1–2 de M-6. |

| # | Tarea | Hecho cuando |
|---|---|---|
| F-4.3 | R-2.5 `GoalProgressReport` (selector de año, corte, alcance) + estado "Sin meta" (UI-44). | — |
| F-4.4 | Gestión de metas: `GoalList`, `GoalDialog` (react-hook-form + yup en `utils/schemas/reports.ts`), eliminación con `sweetalert2`; Server Actions `createGoal`, `updateGoal`, `deleteGoal` con `revalidateTag("reports-goals")` y `revalidateTag("reports")`. Botones según permisos (UI-05). | UI-40 a UI-45; el 409 muestra el mensaje de la API. |
| F-5.1 | R-3.1 `StandardVsRealReport` con semáforo y panel lateral de detalle por insumo (lectura en cliente con `API()` al hacer clic). | Filtro por color y nota "No incluye mano de obra" visible. |
| F-5.3 | R-4.2 `ExpirationReport` (fechas por defecto hoy … +90, colores por días, barras de valor en riesgo por mes). | Con `subject=feedstock` no aparece la advertencia de saldo estimado. |
| F-6.2 | Tarea B-6 (inicio) y tarjeta de meta en `DashboardCards`. | CA de M-6. |
| F-E3.1 | PDF (UI-31, UI-32): `pnpm add jspdf jspdf-autotable`; `utils/reports/pdf.ts` (título, filtros, advertencias, imagen del gráfico por `ApexCharts.exec(chartId, "dataURI")`, tabla con `jspdf-autotable`, carta horizontal); botón PDF en `ExportButtons` y "PDF consolidado" en el Tablero. | El PDF se descarga con el patrón de nombre de §7.1 de las specs. |
| F-E3.2 | Permisos de metas: `ABILITY_FIELDS.SALES_GOALS = "Metas de venta"`; chequeo `ability.can(ABILITY_ACTIONS.CREATE, ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION, ABILITY_FIELDS.SALES_GOALS)`. | CA 3 de M-4. |
| F-E3.3 | Front de B-1 (fecha de venta) y B-5 (redirección). | Criterios de B-1 y B-5. |
| F-E3.4 | Tipos y capa de API: `SalesGoal`, `SalesGoalProgress`, filas de R-3.1 y R-4.2; `getGoalsServer`, `getGoalProgressServer`, `getStandardVsRealDetail`; `actions.ts` con `createGoal`, `updateGoal`, `deleteGoal` (devuelven `{ success, error? }`). | Los nombres de campo coinciden con el JSON. |

Archivos del front que agrega la Etapa 3: `views/.../informes/meta/` (`GoalProgressReport`, `GoalList`, `GoalDialog`), `views/.../informes/inventario/ExpirationReport.tsx`, `costeo/StandardVsRealReport.tsx` y `StandardVsRealDetail.tsx`, `charts/GoalProgressChart.tsx`, `utils/reports/pdf.ts`, `utils/schemas/reports.ts`, `api/reports/actions.ts`, y cambios en `app/(dashboard)/home/page.tsx` y `app/(dashboard)/soporte/reportes/page.tsx`.

### 11.5 Pruebas de la Etapa 3

- **Back:** semáforo en los bordes (0, umbral, umbral + 0,01); KPIs de meta (bisiesto, `asOf` en el último día del año); validaciones de metas (alcance excluyente, duplicado → 409); `subject=packaging` en vencimientos → 400; advertencia de fecha de venta con un rango mixto.
- **Front:**

| Qué se prueba | Casos mínimos |
|---|---|
| `GoalDialog` / `schemas/reports.ts` | Valor ≤ 0, año anterior al permitido, línea y producto a la vez → error; edición con alcance deshabilitado. |
| Esquema de fecha de venta (B-1) | Fecha futura y de más de un año atrás rechazadas; vacío → hoy. |
| `params.ts` | Valores por defecto de R-4.2 (hoy … +90) y R-2.5 (año en curso, corte hoy). |
