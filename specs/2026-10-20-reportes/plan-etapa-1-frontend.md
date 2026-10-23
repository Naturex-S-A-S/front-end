# Plan de implementación — Informes, Etapa 1 (frontend)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, user constraints override the skill defaults: no new test files and no commits.

**Goal:** Construir la página `/finanzas-y-administracion/informes` con los cinco reportes de la Etapa 1, filtros por URL, exportación XLSX/CSV y el aviso B-7.

**Architecture:** Una página Server Component valida sesión/permiso y resuelve pestaña, reporte y filtros desde `searchParams`. Un `registry` tipado alimenta pestañas, selector, filtros y endpoints; un `DataFetcher` async consulta catálogos y reporte en paralelo; componentes cliente renderizan Recharts y tablas, y escriben la URL con `router.replace` dentro de `startTransition`. La API se consume con `apiFetch` en servidor y axios solo para exportar blobs.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, MUI v5, Tailwind 3, Recharts 3, react-hook-form, next-auth v4, axios.

**Spec:** `specs/2026-10-20-reportes/spec-funtional.md` y `specs/2026-10-20-reportes/contrato-api.md`

**Fecha:** 2026-10-20  
**Estado:** plan listo para ejecución  
**Ruta objetivo:** `/finanzas-y-administracion/informes`

## Global Constraints

- Solo se modifica `front-end`; no backend, SQL ni migraciones.
- Usar Recharts; no instalar ApexCharts.
- Mantener `/test/reportes` y aislar sus tipos/API antes de crear la página real.
- No agregar mocks ni flags a la ruta real.
- No crear archivos de test nuevos.
- No hacer commit salvo petición explícita.
- Fechas en `yyyy-MM-dd`; rango máximo de 731 días; `from <= to`.
- `ivaPct = 0` fijo y oculto en R-2.1.
- Español en UI, COP sin decimales, kg/ton con 3 decimales, porcentajes con 2.
- Respetar `output: "standalone"` en `next.config.mjs`.
- El menú se genera desde permisos; no editar `verticalMenuData` para Informes.

---

## 1. Objetivo

Construir la página de Informes de la Etapa 1 con los cinco reportes:

| reportKey | Reporte | Pestaña |
|---|---|---|
| `production-volume` | R-1.1 Kg / ton producidas | Producción |
| `production-comparison` | R-1.2 Comparativo contra el año anterior | Producción |
| `production-mass-balance` | R-1.3 Balance de masa y rendimiento | Producción |
| `production-cost-per-kg` | R-1.5 Costo por kg / ton producido | Producción |
| `top-products` | R-2.1 Top de productos más vendidos | Ventas |

La página debe incluir:

- Pestañas **Producción** y **Ventas**.
- Selector de reporte dentro de cada pestaña.
- Filtros por URL, con fecha obligatoria, atajos y validación local.
- Gráfico y tabla por reporte.
- Advertencias de la API.
- Exportación XLSX/CSV con los mismos filtros de la URL.
- Aviso B-7 en el detalle de un período CIF abierto de un mes vencido.
- Permiso de lectura sobre **Finanzas y administración › Informes**.

---

## 2. Decisiones cerradas

1. **Solo frontend.** No se implementan endpoints, consultas SQL, migraciones ni pruebas de back.
2. **Recharts**, no ApexCharts. `recharts@3.10.1` ya está instalado. Esto reemplaza las referencias a ApexCharts de `contrato-api.md` §7.1 y de F-8.3.
3. **La API real es el camino principal.** Los endpoints `/api/reports/*` todavía no están confirmados. No se agregan mocks ni flags a la ruta real; el prototipo `/test/reportes` queda como contingencia visual.
4. **Se conserva el prototipo.** Antes de crear la Etapa 1 se aíslan sus tipos y su API para que no colisionen con los nuevos.
5. **No se crean archivos de test nuevos.** Se ejecutan los tests existentes y se actualizan solo los imports del prototipo.
6. **No se hace commit** salvo petición explícita.
7. **IVA oculto en R-2.1:** se envía `ivaPct=0` (decisión D-1) y no se muestra selector.
8. **Formulaciones:** el contrato de `/api/reports/filters` no incluye formulaciones ni versiones. La UI solo mostrará esos selectores si el catálogo trae `formulations`/`versions`; si no, el reporte funciona sin esos filtros. Queda como brecha conocida para el back.

---

## 3. Estado de partida

Ya existe un prototipo funcional y sin autenticación:

```
src/api/reports/server.ts
src/api/reports/__tests__/server.test.ts
src/types/pages/reports.ts
src/utils/mocks/reports/productionVolume.ts
src/utils/reports/productionVolume.ts
src/utils/reports/productionVolumeComparison.ts
src/utils/reports/productionBalance.ts
src/utils/reports/__tests__/productionVolume.test.ts
src/app/(blank-layout-pages)/test/reportes/page.tsx
src/views/pages/soporte/reportes/volumen-elaborado/*
```

Ese prototipo implementa visualmente R-1.1, R-1.2 y R-1.3 con datos mock. **No se elimina**. Sus tipos y su API se renombran en la Tarea 0.

---

## 4. Arquitectura objetivo

```
src/
├── app/(dashboard)/finanzas-y-administracion/informes/
│   ├── page.tsx
│   └── loading.tsx
├── api/reports/
│   ├── server.ts
│   ├── index.ts
│   └── prototype.ts                    # API mock del prototipo, renombrada
├── types/pages/
│   ├── reports.ts                      # DTOs nuevos
│   └── reports-prototype.ts            # tipos del prototipo, renombrados
├── hooks/reports/
│   └── useReportUrl.ts
├── utils/
│   ├── columns/reports.tsx
│   ├── constant/index.ts
│   └── reports/
│       ├── registry.ts
│       ├── params.ts
│       ├── format.ts
│       ├── pivot.ts
│       └── colors.ts
└── views/pages/finanzas-y-administracion/informes/
    ├── tabs.tsx
    ├── report-selector.tsx
    ├── report-renderer.tsx
    ├── filters/
    │   ├── report-filter-bar.tsx
    │   ├── date-range-filter.tsx
    │   ├── multi-select-filter.tsx
    │   ├── active-filter-chips.tsx
    │   └── uncategorized-notice.tsx
    ├── shared/
    │   ├── report-card.tsx
    │   ├── report-warnings.tsx
    │   ├── report-table.tsx
    │   ├── report-error.tsx
    │   ├── empty-state.tsx
    │   ├── metric-cards.tsx
    │   └── export-buttons.tsx
    ├── charts/
    │   ├── stacked-bar-chart.tsx
    │   ├── line-comparison-chart.tsx
    │   ├── grouped-bar-chart.tsx
    │   └── horizontal-bar-chart.tsx
    ├── produccion/
    │   ├── volume-report.tsx
    │   ├── comparison-report.tsx
    │   ├── mass-balance-report.tsx
    │   └── cost-per-kg-report.tsx
    └── ventas/
        └── top-products-report.tsx
```

### Flujo de una consulta

1. `page.tsx` valida sesión y permiso.
2. `resolveReportSelection(searchParams)` resuelve pestaña, reporte y filtros.
3. La página renderiza pestañas y selector (client) de inmediato.
4. Un `DataFetcher` async ejecuta en paralelo:
   - `getReportFiltersServer(subject)`.
   - `getReportServer(entry.endpoint, filters)`.
5. `ReportData` renderiza `ReportFilterBar` con el catálogo y `ReportRenderer` con el resultado.
6. `ReportRenderer` elige el componente del reporte y le pasa datos tipados.
7. La barra de filtros y los controles del reporte solo escriben en la URL con `router.replace()` dentro de `startTransition`.
8. La exportación usa el mismo `filters` de la URL y llama al endpoint de exportación.

### Estado en URL

Formato canónico:

```
/finanzas-y-administracion/informes
  ?tab=produccion
  &report=production-volume
  &from=2026-10-01
  &to=2026-10-20
  &subject=product
  &granularity=month
  &groupBy=line
  &unit=kg
```

Reglas:

- `tab` y `report` siempre presentes en la URL generada.
- Si `report` falta o no existe, se usa el primer reporte de la pestaña.
- Si `tab` no coincide con `report`, manda `report.tab`.
- `from`/`to` siempre presentes.
- Solo se serializan filtros soportados por el reporte.
- Listas separadas por coma (`productIds=a,b`).
- Al cambiar de reporte se conservan los filtros compartidos; los no soportados se descartan.
- `router.replace`, nunca `push`.
- El texto del lote se aplica 500 ms después de dejar de escribir (UI-15).

---

## 5. Contrato de datos frontend

`src/types/pages/reports.ts` será el espejo estricto de los DTOs de la Etapa 1. No reutilizar los tipos del prototipo.

### 5.1 Tipos base

```ts
import type { ReactNode } from "react";

export type ReportTab = "produccion" | "ventas";

export type ReportKey =
  | "production-volume"
  | "production-comparison"
  | "production-mass-balance"
  | "production-cost-per-kg"
  | "top-products";

export type ReportFilterKey =
  | "dateRange"
  | "subject"
  | "granularity"
  | "groupBy"
  | "unit"
  | "productIds"
  | "batch"
  | "lineIds"
  | "categoryIds"
  | "providerIds"
  | "formulationId"
  | "versionId"
  | "minLossPct"
  | "cifTypeIds"
  | "origin"
  | "metric"
  | "top"
  | "ivaPct";

export type ReportUnit = "kg" | "ton" | "units";
export type ReportGranularity = "day" | "week" | "month" | "year";
export type VolumeSubject = "product" | "feedstock" | "packaging";
export type VolumeGroupBy = "line" | "category" | "product";
export type SalesMetric = "cop" | "kg" | "units";
export type SalesOrigin = "siigo" | "remision";

export interface IReportOption {
  id: string | number;
  name: string;
}

export interface IReportProductOption extends IReportOption {
  lineId?: string | null;
  categoryId?: string | null;
}

export interface IReportFilters {
  from: string;
  to: string;
  subject?: VolumeSubject;
  granularity?: ReportGranularity;
  groupBy?: VolumeGroupBy;
  unit?: ReportUnit;
  productIds?: string[];
  batch?: string;
  lineIds?: string[];
  categoryIds?: string[];
  providerIds?: number[];
  formulationId?: string;
  versionId?: string;
  minLossPct?: number;
  cifTypeIds?: number[];
  origin?: SalesOrigin;
  metric?: SalesMetric;
  top?: number;
  ivaPct?: number;
}

export interface IReportFiltersCatalog {
  lines: IReportOption[];
  categories: IReportOption[];
  products: IReportProductOption[];
  providers: IReportOption[];
  origins: IReportOption[];
  cifTypes: IReportOption[];
  formulations?: IReportOption[];
  versions?: IReportOption[];
  uncategorized: {
    products: number;
    feedstock: number;
    packaging: number;
  };
}

export interface IReportWarning {
  code: string;
  message: string;
  count?: number | null;
}

export interface IReportMeta {
  report: string;
  dateField: string;
  filters: Record<string, unknown>;
  generatedAt: string;
  notes?: string[];
}

export interface IReportResult<TData, TTotals> {
  meta: IReportMeta;
  warnings: IReportWarning[];
  totals: TTotals;
  data: TData[];
}

export interface ReportColumn<TData, TTotals = unknown> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render: (row: TData) => ReactNode;
  sortValue?: (row: TData) => string | number | null;
  renderTotal?: (totals: TTotals) => ReactNode;
}
```

### 5.2 DTOs por reporte

```ts
export interface IProductionVolumeRow {
  period: string;
  lineId: string | null;
  lineName: string;
  categoryId: string | null;
  categoryName: string;
  kg: number;
  ton: number;
  orders: number;
}

export interface IProductionVolumeTotals {
  kg: number;
  ton: number;
  orders: number;
}

export interface IProductionComparisonRow {
  periodLabel: string;
  current: number;
  previous: number;
  currentCumulative: number;
  previousCumulative: number;
  variationPct: number | null;
}

export interface IProductionComparisonTotals {
  current: number;
  previous: number;
  variationPct: number | null;
}

export interface IMassBalanceProduct {
  productId: string;
  productName: string;
}

export interface IMassBalanceLine {
  lineId: string | null;
  lineName: string;
}

export interface IMassBalanceRow {
  orderId: number;
  batch: string;
  closedAt: string;
  products: IMassBalanceProduct[];
  lines: IMassBalanceLine[];
  expectedKg: number;
  producedKg: number;
  lossKg: number;
  lossPct: number;
  yieldPct: number;
  extraFeedstockKg: number;
}

export interface IMassBalanceTotals {
  expectedKg: number;
  producedKg: number;
  lossKg: number;
  lossPct: number;
  orders: number;
}

export interface ICostCifType {
  typeId: number;
  typeName: string;
  copKg: number;
}

export interface ICostPerKgRow {
  period: string;
  kg: number;
  feedstockCopKg: number;
  packagingCopKg: number;
  cifCopKg: number;
  cifByType: ICostCifType[];
  totalCopKg: number;
  totalCopTon: number;
  cifIncomplete: boolean;
  materialIncomplete: boolean;
}

export interface ICostPerKgTotals {
  kg: number;
  feedstockCopKg: number;
  packagingCopKg: number;
  cifCopKg: number;
  totalCopKg: number;
  totalCopTon: number;
}

export interface ITopProductRow {
  rank: number;
  productId: string;
  productName: string;
  lineName: string;
  categoryName: string;
  units: number;
  kg: number;
  netSales: number;
  valuedRemissionLines: number;
}

export interface ITopProductTotals {
  units: number;
  kg: number;
  netSales: number;
  products: number;
}
```

`IReportResult` no incluye `success` porque los GET exitosos devuelven el sobre directamente. Los errores se convierten en `{ data: null, error }` en `getReportServer`.

---

## 6. Tareas

### Tarea 0 — Aislar el prototipo

**Estado:** completada el 2026-10-20. `tsc` solo muestra los 2 errores preexistentes; los 15 tests del prototipo pasan.

**Archivos:**

- `src/types/pages/reports.ts` → `src/types/pages/reports-prototype.ts`
- `src/api/reports/server.ts` → `src/api/reports/prototype.ts`
- 17 archivos que importan esos módulos.

**Pasos:**

1. Renombrar los dos archivos (están sin trackear; no hace falta `git mv`).
2. Actualizar imports:

```bash
rg -l '@/types/pages/reports' src \
  | xargs sed -i 's#@/types/pages/reports#@/types/pages/reports-prototype#g'

rg -l '@/api/reports/server' src \
  | xargs sed -i 's#@/api/reports/server#@/api/reports/prototype#g'
```

3. Revisar manualmente los 17 archivos, en especial:
   - `src/app/(blank-layout-pages)/test/reportes/page.tsx`
   - `src/api/reports/__tests__/server.test.ts`
   - `src/views/pages/soporte/reportes/volumen-elaborado/*`
4. Confirmar que no quede ninguna referencia a los nombres viejos:

```bash
rg '@/types/pages/reports|@/api/reports/server' src
```

5. Verificar que `/test/reportes` sigue compilando y que los tests del prototipo pasan.

**Validación:**

```bash
npx tsc --noEmit
pnpm test:run src/api/reports/__tests__/server.test.ts src/utils/reports/__tests__/productionVolume.test.ts
```

Se aceptan los dos errores preexistentes de `produccion/aprovisionamiento` y `produccion/ordenes`; no debe aparecer ninguno nuevo.

---

### Tarea 1 — Registro, tipos y permiso

**Estado:** completada el 2026-10-20. `tsc` solo muestra los 2 errores preexistentes; `eslint` limpio y las 5 entradas del registro incluyen `dateRange`.

**Archivos:**

- `src/types/pages/reports.ts` (nuevo, con §5)
- `src/utils/constant/index.ts`
- `src/utils/reports/registry.ts`

**Pasos:**

1. Agregar el campo de permiso:

```ts
export const ABILITY_FIELDS = {
  LISTADO: "Listado",
  ENTRADAS: "Control de entradas",
  SALIDAS: "Control de salidas",
  MOVIMIENTOS: "Historial de movimientos",
  CATEGORIES: "Categorias",
  COLOR: "Color",
  BODEGAS: "Bodegas",
  FORMULATION: "Formulación",
  SUPPLIERS: "Proveedores",
  ORDERS: "Ordenes",
  PROVISIONING: "Aprovisionamiento",
  INFORMES: "Informes"
};
```

2. Crear `registry.ts` como única fuente de verdad:

```ts
import type { IReportFilters, ReportFilterKey, ReportKey, ReportTab } from "@/types/pages/reports";

export interface ReportEntry {
  key: ReportKey;
  tab: ReportTab;
  label: string;
  endpoint: string;
  dateLabel: string;
  filters: readonly ["dateRange", ...ReportFilterKey[]];
  defaults: Partial<IReportFilters>;
  exportable: boolean;
}

export const REPORTS = {
  "production-volume": {
    key: "production-volume",
    tab: "produccion",
    label: "Kg / ton producidas",
    endpoint: "production/volume",
    dateLabel: "Fecha de ingreso a inventario",
    filters: [
      "dateRange",
      "subject",
      "granularity",
      "groupBy",
      "unit",
      "productIds",
      "batch",
      "lineIds",
      "categoryIds",
      "providerIds",
      "formulationId"
    ],
    defaults: { subject: "product", granularity: "month", groupBy: "line", unit: "kg" },
    exportable: true
  },
  "production-comparison": {
    key: "production-comparison",
    tab: "produccion",
    label: "Comparativo contra el año anterior",
    endpoint: "production/comparison",
    dateLabel: "Fecha de ingreso a inventario",
    filters: ["dateRange", "granularity", "unit", "productIds", "lineIds", "categoryIds"],
    defaults: { granularity: "month", unit: "ton" },
    exportable: true
  },
  "production-mass-balance": {
    key: "production-mass-balance",
    tab: "produccion",
    label: "Balance de masa y rendimiento",
    endpoint: "production/mass-balance",
    dateLabel: "Fecha de cierre de la orden",
    filters: [
      "dateRange",
      "productIds",
      "batch",
      "lineIds",
      "categoryIds",
      "formulationId",
      "versionId",
      "minLossPct"
    ],
    defaults: {},
    exportable: true
  },
  "production-cost-per-kg": {
    key: "production-cost-per-kg",
    tab: "produccion",
    label: "Costo por kg / ton",
    endpoint: "production/cost-per-kg",
    dateLabel: "Fecha del snapshot de costo",
    filters: [
      "dateRange",
      "granularity",
      "unit",
      "productIds",
      "batch",
      "lineIds",
      "categoryIds",
      "cifTypeIds"
    ],
    defaults: { granularity: "month", unit: "kg" },
    exportable: true
  },
  "top-products": {
    key: "top-products",
    tab: "ventas",
    label: "Top de productos vendidos",
    endpoint: "sales/top-products",
    dateLabel: "Fecha de carga del archivo",
    filters: [
      "dateRange",
      "productIds",
      "lineIds",
      "categoryIds",
      "origin",
      "metric",
      "top",
      "ivaPct"
    ],
    defaults: { metric: "cop", top: 10, ivaPct: 0 },
    exportable: true
  }
} satisfies Record<ReportKey, ReportEntry>;

export const REPORTS_BY_TAB: Record<ReportTab, ReportEntry[]> = {
  produccion: [
    REPORTS["production-volume"],
    REPORTS["production-comparison"],
    REPORTS["production-mass-balance"],
    REPORTS["production-cost-per-kg"]
  ],
  ventas: [REPORTS["top-products"]]
};

export const getReportEntry = (key?: string | null): ReportEntry | null =>
  key && key in REPORTS ? REPORTS[key as ReportKey] : null;

export const getDefaultReportForTab = (tab: ReportTab): ReportEntry => REPORTS_BY_TAB[tab][0];
```

3. No agregar `Informes` a `verticalMenuData` ni a `paths.ts`. El menú ya se construye desde los módulos del JWT; el backend debe registrar el submódulo con path `/finanzas-y-administracion/informes`.

**Validación:**

- `REPORTS` compila con todas las claves de la Etapa 1.
- Cada entrada incluye `dateRange`.
- Ningún filtro `clientIds` aparece en el registro.
- `npx tsc --noEmit` sin errores nuevos.

---

### Tarea 2 — Utilidades de filtros, formato, pivote y colores

**Estado:** completada el 2026-10-20. `tsc` solo muestra los 2 errores preexistentes; `pnpm lint` sin errores. Smoke test: 731 días válido, 732 inválido, `from > to` inválido, `lineIds` → `lotCategoryIds`, `ivaPct=0`, `formatCop(1234567) = $1.234.567`.

**Archivos:**

- `src/utils/reports/params.ts`
- `src/utils/reports/format.ts`
- `src/utils/reports/pivot.ts`
- `src/utils/reports/colors.ts`

#### 2.1 `params.ts`

Responsabilidades:

- Rango por defecto del mes en curso.
- Resolver `tab`, `report` y filtros desde `searchParams`.
- Validar localmente las reglas RG-01, RG-02, `top` y `minLossPct`.
- Serializar filtros hacia la API y hacia la URL.
- Cambiar de reporte conservando solo filtros compatibles.

API pública sugerida:

```ts
export interface ReportSelection {
  tab: ReportTab;
  report: ReportEntry;
  filters: IReportFilters;
  error: string | null;
}

export interface ReportValidation {
  valid: boolean;
  errors: Partial<Record<keyof IReportFilters | "dateRange", string>>;
}

export const getDefaultDateRange = (now?: Date): Pick<IReportFilters, "from" | "to">;
export const createDefaultFilters = (report: ReportEntry, now?: Date): IReportFilters;
export const resolveReportSelection = (searchParams: SearchParams): ReportSelection;
export const validateFilters = (filters: IReportFilters): ReportValidation;
export const toApiParams = (filters: IReportFilters): Record<string, string | number>;
export const buildReportSearchParams = (selection: Omit<ReportSelection, "error">): URLSearchParams;
export const switchReportFilters = (
  current: IReportFilters,
  target: ReportEntry,
  now?: Date
): IReportFilters;
```

Reglas de implementación:

- `from` y `to` se parsean con `date-fns` y se comprueba que el formato de vuelta sea `yyyy-MM-dd`.
- Rango por defecto: `startOfMonth(now)` a `now`.
- `differenceInCalendarDays(to, from) + 1 > 731` → error.
- `from > to` → `"La fecha inicial no puede ser posterior a la fecha final."`
- Rango excedido → `"El rango no puede superar los 731 días."`
- `top` fuera de `1..100` → error.
- `minLossPct` fuera de `0..100` → error.
- Listas: aceptar `a,b,c` y parámetros repetidos. Normalizar a arrays sin vacíos.
- `providerIds` y `cifTypeIds` se convierten a `number[]`; los IDs inválidos se descartan.
- `subject` inválido → `product`.
- `granularity` inválido → `month`.
- `unit` inválido → `kg`.
- `metric` inválido → `cop`.
- `origin` inválido → `undefined`.
- `ivaPct` se fuerza a `0` en `top-products`, aunque no venga en la URL.
- `lineIds` se serializa a la API como `lotCategoryIds`.
- `toApiParams` omite arrays vacíos, strings vacíos y `undefined`.
- `toApiParams` incluye `from`, `to`, `ivaPct=0` para `top-products` y `top` por defecto.
- `switchReportFilters` parte de `createDefaultFilters(target)`, copia siempre `from` y `to`, y luego copia solo las claves que existen en `target.filters` y en `current`.
- `buildReportSearchParams` siempre escribe `tab`, `report`, `from`, `to`.

Tipos de `searchParams`:

```ts
export type SearchParams = Record<string, string | string[] | undefined>;
```

#### 2.2 `format.ts`

Usar `Intl.NumberFormat("es-CO")` y `date-fns`:

```ts
export const formatCop = (value: number | null | undefined): string;
export const formatKg = (value: number | null | undefined): string;
export const formatTon = (value: number | null | undefined): string;
export const formatPct = (value: number | null | undefined): string;
export const formatCompact = (value: number | null | undefined): string;
export const formatCompactCop = (value: number | null | undefined): string;
export const formatDate = (value: string | null | undefined): string;
export const formatPeriodLabel = (period: string, granularity?: ReportGranularity): string;
```

Reglas:

- `null`/`undefined` → `"—"`.
- COP: `$1.234.567`, sin decimales.
- Kg y ton: 3 decimales con coma.
- Porcentaje: 2 decimales con `%`.
- Abreviado: `$1,2 M`, `1,2 mil`.
- Fechas: `dd/MM/yyyy`.
- `periodLabel` de comparación: `"01"` → `"Ene"`, `"W01"` → `"Sem 01"`.
- No reutilizar `formatCurrency` de `src/utils/format.ts`: usa 2 decimales y no cumple RG-09.

#### 2.3 `pivot.ts`

```ts
export interface PivotSeries {
  key: string;
  label: string;
  color: string;
}

export interface PivotResult {
  data: Array<Record<string, string | number>>;
  series: PivotSeries[];
}

export function pivotStacked<T>(rows: T[], options: {
  period: (row: T) => string;
  series: (row: T) => { id: string; name: string };
  value: (row: T) => number;
}): PivotResult;
```

Reglas:

- Una fila de salida por período existente. **No crear períodos vacíos.**
- Cada serie se rellena con `0` solo dentro de períodos existentes.
- El orden de períodos es el de entrada.
- El orden de series es el de primera aparición.
- El color sale de `getLineColor(series.id)`.
- Para R-1.5, aplanar `cifByType` en filas sintéticas antes de llamar al pivote.

#### 2.4 `colors.ts`

```ts
export function getLineColor(id?: string | number | null): string;
```

- `null`, `""` o `"none"` → gris (`#9E9E9E`).
- Hash determinista del `id` contra una paleta de 10–12 colores.
- La misma línea debe recibir el mismo color aunque cambie el orden de las filas.
- No usar índices de fila.

**Validación de la tarea:**

```bash
npx tsc --noEmit
pnpm lint
```

Smoke test manual con `pnpm exec tsx -e` para comprobar:

- 731 días válidos, 732 inválidos.
- `from > to` inválido.
- `lineIds` se convierte en `lotCategoryIds`.
- `ivaPct=0` en top-products.
- `formatCop(1234567)` → `$1.234.567`.

---

### Tarea 3 — Capa de API

**Estado:** completada el 2026-10-20. `tsc` solo muestra los 2 errores preexistentes; `pnpm lint` sin errores. La validación contra API real queda pendiente de que existan los endpoints.

**Archivos:**

- `src/api/reports/server.ts`
- `src/api/reports/index.ts`

#### 3.1 `server.ts`

```ts
import "server-only";

import type { IReportFilters, IReportFiltersCatalog, IReportResult } from "@/types/pages/reports";
import { apiFetch } from "@/api/apiFetch";
import { toApiParams } from "@/utils/reports/params";

export interface ReportServerResponse<TData, TTotals> {
  data: IReportResult<TData, TTotals> | null;
  error: string | null;
}

export interface ReportCatalogResponse {
  data: IReportFiltersCatalog;
  error: string | null;
}

const emptyCatalog: IReportFiltersCatalog = {
  lines: [],
  categories: [],
  products: [],
  providers: [],
  origins: [],
  cifTypes: [],
  uncategorized: { products: 0, feedstock: 0, packaging: 0 }
};

export async function getReportServer<TData, TTotals>(
  endpoint: string,
  filters: IReportFilters
): Promise<ReportServerResponse<TData, TTotals>> {
  try {
    const params = new URLSearchParams();

    Object.entries(toApiParams(filters)).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    const data = await apiFetch<IReportResult<TData, TTotals>>(
      `reports/${endpoint}?${params.toString()}`,
      { tags: ["reports", `reports-${endpoint}`] }
    );

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No se pudo cargar el reporte."
    };
  }
}

export async function getReportFiltersServer(
  subject: "product" | "feedstock" | "packaging" = "product"
): Promise<ReportCatalogResponse> {
  try {
    const data = await apiFetch<IReportFiltersCatalog>(
      `reports/filters?subject=${subject}`,
      { tags: ["reports-filters", `reports-filters-${subject}`] }
    );

    return { data: { ...emptyCatalog, ...data }, error: null };
  } catch (error) {
    return {
      data: emptyCatalog,
      error: error instanceof Error ? error.message : "No se pudieron cargar los filtros."
    };
  }
}
```

`emptyCatalog` debe tener arrays vacíos y `uncategorized` en ceros. La barra de filtros sigue funcionando con fecha y lote aunque falle el catálogo.

**Importante:** a diferencia de otros `server.ts`, este no devuelve `null` en error. Devuelve `{ data, error }` para que la tarjeta muestre el `message` de la API (UI-22).

#### 3.2 `index.ts`

```ts
import { API } from "@/api/instances";
import type { IReportFilters } from "@/types/pages/reports";
import { toApiParams } from "@/utils/reports/params";

export type ExportFormat = "xlsx" | "csv";

export async function exportReport(
  reportKey: string,
  filters: IReportFilters,
  format: ExportFormat
): Promise<void>;
```

Implementación:

1. Llamar:

```ts
API().get(`/reports/${reportKey}/export`, {
  params: { ...toApiParams(filters), format },
  responseType: "blob"
});
```

2. Leer `content-disposition`:
   - `filename*=UTF-8''...`
   - `filename="..."`
   - fallback `reporte-${reportKey}-${from}_${to}.${format}`.
3. Crear `URL.createObjectURL(blob)`, `<a download>`, click y `revokeObjectURL`.
4. Si la respuesta es error y llega como `Blob`, leer el texto, parsear JSON y usar `message`.
5. Si no se puede parsear, lanzar `Error("No se pudo exportar el reporte.")`.

**Caché y frescura:** `apiFetch` usa cookies y `getServerSession`, por lo que la ruta es dinámica. No agregar `cache: "no-store"` en esta tarea. Verificar en la validación que dos consultas con los mismos filtros traen datos frescos; si no, extender `apiFetch` con una opción `cache` y usarla solo en reportes.

**Validación:**

- `npx tsc --noEmit`.
- Con API disponible: consultar un reporte y exportar XLSX/CSV.
- Sin API: confirmar que el error se propaga como mensaje, no como excepción de servidor.

---

### Tarea 4 — Ruta, página, pestañas y selector

**Estado:** completada el 2026-10-20. `page.tsx` valida permiso con CASL, resuelve la URL y consulta catálogo + reporte en paralelo; pestañas, selector y `loading.tsx` listos. `tsc` solo muestra los 2 errores preexistentes; `pnpm lint` sin errores.

**Archivos:**

- `src/app/(dashboard)/finanzas-y-administracion/informes/page.tsx`
- `src/app/(dashboard)/finanzas-y-administracion/informes/loading.tsx`
- `src/views/pages/finanzas-y-administracion/informes/tabs.tsx`
- `src/views/pages/finanzas-y-administracion/informes/report-selector.tsx`
- `src/hooks/reports/useReportUrl.ts`

#### 4.1 Página

```tsx
import { getServerSession } from "next-auth";

import { Alert, Stack, Typography } from "@mui/material";

import PageHeader from "@/@core/components/page-header";
import { authOptions } from "@/lib/nextAuthOptions";
import defineAbilityFor from "@/utils/ability";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import type { IReportFilters } from "@/types/pages/reports";
import type { ReportEntry } from "@/utils/reports/registry";
import { resolveReportSelection, type SearchParams } from "@/utils/reports/params";
import { getReportFiltersServer, getReportServer } from "@/api/reports/server";
import ReportTabs from "@/views/pages/finanzas-y-administracion/informes/tabs";
import ReportSelector from "@/views/pages/finanzas-y-administracion/informes/report-selector";
import ReportFilterBar from "@/views/pages/finanzas-y-administracion/informes/filters/report-filter-bar";
import ReportRenderer from "@/views/pages/finanzas-y-administracion/informes/report-renderer";

export const metadata = {
  title: "Informes - Naturex",
  description: "Informes de producción y ventas"
};

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  const ability = defineAbilityFor(session?.permissions ?? [], session?.role ?? "");
  const canRead = ability.can(
    ABILITY_ACTIONS.READ,
    ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION,
    ABILITY_FIELDS.INFORMES
  );

  if (!canRead) {
    return <Alert severity='error'>No tiene permisos para acceder a Informes.</Alert>;
  }

  const selection = resolveReportSelection(searchParams);

  return (
    <Stack spacing={3}>
      <PageHeader title={<Typography variant='h4'>Informes</Typography>} />
      <ReportTabs tab={selection.tab} filters={selection.filters} />
      <ReportSelector report={selection.report} filters={selection.filters} />
      {selection.error ? (
        <Alert severity='error'>{selection.error}</Alert>
      ) : (
        <ReportData report={selection.report} filters={selection.filters} />
      )}
    </Stack>
  );
}

async function ReportData({ report, filters }: { report: ReportEntry; filters: IReportFilters }) {
  const [catalog, result] = await Promise.all([
    getReportFiltersServer(filters.subject ?? "product"),
    getReportServer(report.endpoint, filters)
  ]);

  return (
    <Stack spacing={3}>
      <ReportFilterBar
        report={report}
        filters={filters}
        catalog={catalog.data}
        catalogError={catalog.error}
      />
      <ReportRenderer report={report} filters={filters} result={result} />
    </Stack>
  );
}
```

Notas:

- `Page` es async por `getServerSession`.
- No se usa `useAbility` porque es server component.
- `loading.tsx` exporta `<Loader type='component' />` para la carga inicial de la ruta.
- Si no hay sesión, el middleware ya redirige; el `Alert` cubre el caso de sesión sin permiso.
- `ReportData` no va dentro de `<Suspense key=…>` para no borrar el contenido anterior en cada cambio de filtro. El estado pendiente se muestra con `isPending` de `useReportUrl` en la barra de filtros. En la primera carga se puede envolver `ReportData` en `<Suspense fallback={<Loader type='component' />}>` sin `key`.

#### 4.2 `useReportUrl.ts`

```ts
"use client";

import { useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";

import type { IReportFilters } from "@/types/pages/reports";
import type { ReportEntry } from "@/utils/reports/registry";
import { buildReportSearchParams } from "@/utils/reports/params";

export function useReportUrl(report: ReportEntry, filters: IReportFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const update = (patch: Partial<IReportFilters>) => {
    const next = { ...filters, ...patch };
    const params = buildReportSearchParams({ tab: report.tab, report, filters: next });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return { update, isPending };
}
```

Todos los controles usan `startTransition` para que Next conserve la vista anterior mientras llega el nuevo RSC (UI-22).

#### 4.3 Pestañas

`tabs.tsx`:

- Client component.
- `Tabs` de MUI con `Producción` y `Ventas`.
- Al cambiar de pestaña:
  - Tomar el primer reporte de la pestaña destino.
  - Conservar solo los filtros compartidos con `switchReportFilters`.
  - `router.replace` dentro de `startTransition`.
- No guardar la pestaña en estado local; se deriva de la URL.

#### 4.4 Selector

`report-selector.tsx`:

- Client component.
- `ToggleButtonGroup` o `Select` con los reportes de `REPORTS_BY_TAB[tab]`.
- Al cambiar:
  - `switchReportFilters(filters, target)`.
  - `router.replace` con `report=target.key` y `tab=target.tab`.
- En pantallas pequeñas, el selector ocupa todo el ancho.

**Validación:**

- Entrar a `/finanzas-y-administracion/informes` sin parámetros → Producción / R-1.1 / mes en curso.
- Recargar una URL con `tab`, `report` y filtros → mismo estado.
- Cambiar de pestaña y de reporte → URL coherente y filtros compartidos conservados.
- Usuario sin permiso → no ve la entrada de menú y, por URL, ve el `Alert` de acceso denegado.

---

### Tarea 5 — Barra de filtros

**Estado:** completada el 2026-10-20. Filtros por reporte, atajos de fecha, multiselect, chips activos, aviso de sin categoría y bloqueo de 731 días; escribe la URL con `router.replace()` dentro de `startTransition`. `pnpm lint` sin errores.

**Archivos:**

- `src/views/pages/finanzas-y-administracion/informes/filters/report-filter-bar.tsx`
- `date-range-filter.tsx`
- `multi-select-filter.tsx`
- `active-filter-chips.tsx`
- `uncategorized-notice.tsx`

**Comportamiento:**

1. `ReportFilterBar` recibe `report`, `filters`, `catalog` y `catalogError`.
2. Obtiene `update` e `isPending` con `useReportUrl(report, filters)`.
3. Si `catalogError` no es `null`, muestra un `Alert severity='warning'` y deja disponibles solo fecha, lote y los filtros numéricos. No bloquea la consulta del reporte.
4. Construye un formulario con `react-hook-form`; los valores iniciales salen de `filters`.
5. Cada control se muestra solo si su clave está en `report.filters`.
6. Fecha:
   - Dos `CustomDatePicker` (`from`, `to`), con `control` y `name`.
   - Atajos: Mes actual, Mes anterior, Últimos 3 meses, Año actual, Año anterior.
   - Rótulo con `report.dateLabel` (UI-10).
   - Validación local antes de llamar a la API (UI-12).
7. Selectores múltiples:
   - Producto, línea, forma, proveedor, tipo de CIF.
   - `CustomAutocomplete multiple` con `options` del catálogo.
   - La forma usa `catalog.categories`, que depende de `subject`.
   - "Sin línea" y "Sin forma" son opciones normales con `id: "none"`; las filas de la API pueden traer `lineId`/`categoryId` en `null`. La UI debe enviar `"none"` cuando el usuario elige esa opción.
8. `subject`:
   - Solo para R-1.1.
   - Al cambiar, limpiar `categoryIds` y `providerIds` y aplicar.
9. `providerIds`:
   - Solo visible en R-1.1 con `subject=feedstock`.
10. Lote:
    - Texto libre.
    - Debounce de 500 ms; al vencer, actualizar la URL.
    - No actualizar en cada tecla.
11. `minLossPct`:
    - Input numérico 0–100, solo R-1.3.
12. `origin`, `metric`, `top`:
    - Solo R-2.1.
    - `origin` permite "Todos" (sin valor).
    - `top`: 5, 10, 20, 50.
    - `ivaPct` no se muestra.
13. Selectores de formulación/versión:
    - Solo si `catalog.formulations`/`catalog.versions` tienen elementos.
    - Si no existen, no se renderizan.
14. Botón **Aplicar filtros**:
    - Valida y actualiza la URL.
    - Deshabilitado si `isPending`.
15. Botón **Limpiar filtros**:
    - Vuelve a `createDefaultFilters(report)`.
16. `ActiveFilterChips`:
    - Encima del gráfico.
    - Una etiqueta por filtro activo, con `onDelete`.
    - Quitar una etiqueta actualiza la URL inmediatamente.
17. `UncategorizedNotice`:
    - Si `catalog.uncategorized` tiene valores > 0.
    - Texto: `"Hay N productos sin línea o forma"` con enlace a:
      - `/inventario/producto-terminado`
      - `/inventario/materia-prima`
      - `/inventario/material-empaque`
    - `Alert severity='warning'`.
18. Responsive:
    - En `<900px`, los filtros se pliegan en un panel (`Accordion` o `Collapse`).
    - La tabla y el gráfico no generan scroll horizontal en la página.

**Opciones por reporte:**

| Filtro | R-1.1 | R-1.2 | R-1.3 | R-1.5 | R-2.1 |
|---|---|---|---|---|---|
| `subject` | Producto / Materia prima | — | — | — | — |
| `granularity` | Día / Semana / Mes / Año | Semana / Mes | — | Mes / Año | — |
| `groupBy` | Línea / Forma / Producto | — | — | — | — |
| `unit` | Kg / Ton | Kg / Ton | — | COP/kg / COP/ton | — |
| `metric` | — | — | — | — | COP / Kg / Unidades |
| `top` | — | — | — | — | 5 / 10 / 20 / 50 |
| `origin` | — | — | — | — | Todos / Siigo / Remisión |
| `minLossPct` | — | — | 0–100 | — | — |

**Errores de validación:**

- Mostrar el mensaje bajo el campo o en un `Alert severity='error'`.
- No llamar a `getReportServer` si la validación falla.
- El mensaje de rango debe coincidir con el del backend.

**Validación manual:**

- Probar 731 y 732 días.
- Probar `from > to`.
- Probar URL con `productIds=a,b`, `lineIds=none`, `top=101`, `minLossPct=101`.
- Probar cambio de `subject` y verificar que la forma se recarga y se limpia.
- Probar el debounce del lote.

---

### Tarea 6 — Componentes compartidos

**Estado:** completada el 2026-10-20. `ReportCard`, `ReportWarnings`, `ReportTable` con orden/totales, `ReportError`, `EmptyState`, `MetricCards` y `ExportButtons` implementados.

**Archivos:**

- `report-card.tsx`
- `report-warnings.tsx`
- `report-table.tsx`
- `report-error.tsx`
- `empty-state.tsx`
- `metric-cards.tsx`
- `export-buttons.tsx`

#### 6.1 `ReportCard`

- Envuelve `CustomCard`.
- Props: `title`, `actions`, `warnings`, `children`.
- Renderiza `ReportWarnings` antes del contenido.
- No renderiza advertencias si `warnings` está vacío.

#### 6.2 `ReportWarnings`

- Un `Alert` por advertencia.
- `SALE_DATE_IS_UPLOAD_DATE` y `ESTIMATED_LOT_BALANCE` → `severity='info'`.
- `CIF_INCOMPLETE` → `severity='warning'` + enlace a `/finanzas-y-administracion/cif`.
- El resto → `severity='warning'`.
- Usar el `message` de la API; si hay `count`, no duplicarlo en el texto.

#### 6.3 `ReportTable`

- MUI `Table`, no `DataGrid`.
- Props:

```ts
interface ReportTableProps<TData, TTotals> {
  rows: TData[];
  columns: ReportColumn<TData, TTotals>[];
  totals?: TTotals;
  getRowKey: (row: TData, index: number) => string | number;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  highlightRow?: (row: TData) => boolean;
  maxHeight?: number;
}
```

- Ordenamiento local por columna cuando existe `sortValue`.
- `null` siempre al final.
- Encabezados en español.
- Números alineados a la derecha.
- Totales en `TableFooter` cuando existe `renderTotal`.
- `TableContainer` con `maxHeight` y `stickyHeader`.
- Resaltado de fila con `bgcolor: "error.light"` y texto legible en R-1.3.
- No usar hooks dentro de las factorías de columnas.

#### 6.4 `ReportError`

- `Alert severity='error'` con el `message`.
- Botón **Reintentar** que llama `router.refresh()`.
- No borrar la barra de filtros si el error es del reporte.

#### 6.5 `EmptyState`

- Texto exacto: `"No hay datos para los filtros seleccionados"`.
- Icono MUI/Iconify.
- No renderizar gráfico ni tabla vacía.
- Los botones de exportación quedan deshabilitados.

#### 6.6 `MetricCards`

- Grid responsive de 2–4 tarjetas.
- Cada tarjeta: label, value, helper opcional.
- Usar `CustomCard variant='outlined'`.
- Valores ya formateados por el reporte.

#### 6.7 `ExportButtons`

- Client component.
- Recibe `reportKey`, `filters`, `disabled`.
- Dos botones: `XLSX` y `CSV`.
- Estado local `loading: "xlsx" | "csv" | null`.
- Mientras exporta, ambos deshabilitados y el botón activo muestra spinner.
- Error: `toast.error(message)` de `react-hot-toast`.
- No exportar si no hay datos.

**Validación:**

- `npx tsc --noEmit`.
- Revisar en claro/oscuro.
- Revisar tabla con muchas filas y scroll interno.

---

### Tarea 7 — Gráficos Recharts

**Estado:** completada el 2026-10-20. Cuatro gráficos con importación dinámica, colores del tema, leyenda clickeable y `aria-label`; sin animación al cambiar filtros.

**Archivos:**

- `src/views/pages/finanzas-y-administracion/informes/charts/stacked-bar-chart.tsx`
- `line-comparison-chart.tsx`
- `grouped-bar-chart.tsx`
- `horizontal-bar-chart.tsx`

Reglas comunes:

- `"use client"`.
- `ResponsiveContainer` con `height` 320–380.
- `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`.
- `Tooltip` con valor exacto y unidad.
- `YAxis` con `formatCompact`.
- `isAnimationActive={false}` para evitar parpadeos al cambiar filtros.
- Leyenda clickeable: estado `hiddenSeries: Set<string>` y `hide` en cada `Bar`/`Line`.
- Colores de `pivot.ts`/`colors.ts`.
- Ejes y grid con colores del tema MUI (`useTheme`), legibles en modo oscuro.
- Contenedor con `minWidth: 0` y `role='img'` + `aria-label` descriptivo.
- No importar Recharts fuera de `charts/`.
- Cargar cada gráfico con `dynamic(() => import(...), { ssr: false, loading: () => <Loader /> })` desde el reporte.

#### 7.1 `StackedBarChart`

- Para R-1.1 y R-1.5.
- Serie apilada (`stackId='total'`).
- R-1.5: el total va como `Line` en un `ComposedChart`, no como barra.
- Props:

```ts
interface StackedBarChartProps {
  data: Array<Record<string, string | number>>;
  series: PivotSeries[];
  xKey: string;
  valueFormatter: (value: number) => string;
  height?: number;
}
```

#### 7.2 `LineComparisonChart`

- Para R-1.2.
- Líneas sólidas: actual y anterior.
- Líneas punteadas: acumulados.
- Colores distintos para año actual/anterior; acumulados con la misma tonalidad y `strokeDasharray`.
- Etiqueta de variación total fuera del gráfico, en una tarjeta.

#### 7.3 `GroupedBarChart`

- Para R-1.3.
- Barras agrupadas por lote: teórico, envasado, merma.
- `XAxis` con `batch`; si hay muchos lotes, permitir `interval={0}` y altura mayor o scroll horizontal del contenedor.

#### 7.4 `HorizontalBarChart`

- Para R-2.1.
- `layout='vertical'`.
- `YAxis type='category' dataKey='name'`.
- `Bar dataKey='value'` con `Cell` por línea.
- Si el nombre es largo, `width` del eje Y 180–220 y `tickFormatter` con truncado.

**Validación:**

- Recharts no aparece en el bundle de otras rutas (importación dinámica).
- Tooltip y leyenda funcionan en claro/oscuro.
- En 390 px no hay scroll horizontal de página.

---

### Tarea 8 — Reportes de producción

**Estado:** completada el 2026-10-20. R-1.1, R-1.2, R-1.3 y R-1.5 con controles en tarjeta, métricas, gráfico, tabla, totales y exportación; columnas en `src/utils/columns/reports.tsx`.

**Archivos:**

- `src/utils/columns/reports.tsx`
- `src/views/pages/finanzas-y-administracion/informes/produccion/volume-report.tsx`
- `comparison-report.tsx`
- `mass-balance-report.tsx`
- `cost-per-kg-report.tsx`
- `src/views/pages/finanzas-y-administracion/informes/report-renderer.tsx`

#### 8.1 `volume-report.tsx` (R-1.1)

- Tipo: `IReportResult<IProductionVolumeRow, IProductionVolumeTotals>`.
- Controles en la tarjeta:
  - `subject`: Producto / Materia prima.
  - `groupBy`: Línea / Forma / Producto.
  - `unit`: Kg / Ton.
  - `granularity`: Día / Semana / Mes / Año.
- Gráfico `StackedBarChart` apilado por `groupBy`.
- Métricas: Kg, Ton, Órdenes.
- Tabla:
  - Período, Línea, Forma, Kg, Ton, Órdenes.
  - Totales del pie con `totals`.
- No rellenar períodos sin producción.
- Si `subject=feedstock`, los títulos deben decir "Materia prima consumida" y la forma sale del catálogo de materia prima.

#### 8.2 `comparison-report.tsx` (R-1.2)

- Tipo: `IReportResult<IProductionComparisonRow, IProductionComparisonTotals>`.
- Controles: granularidad mes/semana; unidad kg/ton.
- Gráfico `LineComparisonChart`.
- Métricas: actual, anterior, variación %.
- Tabla:
  - Período, Actual, Anterior, Variación %, Acumulado actual, Acumulado anterior.
- Si `variationPct` es `null`, mostrar `"—"`.
- Mostrar advertencia `NO_PREVIOUS_YEAR_DATA` si viene.

#### 8.3 `mass-balance-report.tsx` (R-1.3)

- Tipo: `IReportResult<IMassBalanceRow, IMassBalanceTotals>`.
- Gráfico `GroupedBarChart` por lote.
- Tabla:
  - Orden, Lote, Cierre, Productos, Líneas, Teórico, Producido, Merma, Merma %, Rendimiento %, MP extra.
- Resaltar filas con `lossPct >= filters.minLossPct` solo si `filters.minLossPct !== undefined`.
- Totales ponderados del pie desde `totals`, no promediar filas.
- Filtro `minLossPct` en la barra de filtros.

#### 8.4 `cost-per-kg-report.tsx` (R-1.5)

- Tipo: `IReportResult<ICostPerKgRow, ICostPerKgTotals>`.
- Controles: unidad COP/kg vs COP/ton.
- Gráfico `StackedBarChart`/`ComposedChart`:
  - Materia prima.
  - Empaque.
  - Un segmento por `cifByType`.
  - Línea de total.
- Tabla:
  - Período, Kg, MP, Empaque, CIF, Total.
  - Si `unit=ton`, los encabezados y valores usan COP/ton.
- Mostrar `cifIncomplete` y `materialIncomplete` como chips o advertencias por fila.
- Si `CIF_INCOMPLETE`, enlace a CIF desde `ReportWarnings`.

#### 8.5 `report-renderer.tsx`

```tsx
"use client";

import type {
  ICostPerKgRow,
  ICostPerKgTotals,
  IMassBalanceRow,
  IMassBalanceTotals,
  IProductionComparisonRow,
  IProductionComparisonTotals,
  IProductionVolumeRow,
  IProductionVolumeTotals,
  IReportFilters,
  IReportResult,
  ITopProductRow,
  ITopProductTotals
} from "@/types/pages/reports";
import type { ReportEntry } from "@/utils/reports/registry";
import ReportError from "./shared/report-error";
import ComparisonReport from "./produccion/comparison-report";
import CostPerKgReport from "./produccion/cost-per-kg-report";
import MassBalanceReport from "./produccion/mass-balance-report";
import VolumeReport from "./produccion/volume-report";
import TopProductsReport from "./ventas/top-products-report";

interface Props {
  report: ReportEntry;
  filters: IReportFilters;
  result: {
    data: IReportResult<unknown, unknown> | null;
    error: string | null;
  };
}

export default function ReportRenderer({ report, filters, result }: Props) {
  if (result.error || !result.data) {
    return <ReportError message={result.error ?? "No se pudo cargar el reporte."} />;
  }

  switch (report.key) {
    case "production-volume":
      return (
        <VolumeReport
          result={result.data as IReportResult<IProductionVolumeRow, IProductionVolumeTotals>}
          filters={filters}
        />
      );
    case "production-comparison":
      return (
        <ComparisonReport
          result={result.data as IReportResult<IProductionComparisonRow, IProductionComparisonTotals>}
          filters={filters}
        />
      );
    case "production-mass-balance":
      return (
        <MassBalanceReport
          result={result.data as IReportResult<IMassBalanceRow, IMassBalanceTotals>}
          filters={filters}
        />
      );
    case "production-cost-per-kg":
      return (
        <CostPerKgReport
          result={result.data as IReportResult<ICostPerKgRow, ICostPerKgTotals>}
          filters={filters}
        />
      );
    case "top-products":
      return (
        <TopProductsReport
          result={result.data as IReportResult<ITopProductRow, ITopProductTotals>}
          filters={filters}
        />
      );
  }
}
```

El cast está contenido aquí y se justifica por el registro. Cada componente de reporte recibe tipos precisos.

**Validación:**

- Cada reporte renderiza con datos, sin datos y con error.
- Los totales del pie coinciden con `totals`.
- Los gráficos cambian al modificar los filtros.
- Exportar desde cada reporte incluye los filtros activos.

---

### Tarea 9 — Reporte de ventas

**Estado:** completada el 2026-10-20. R-2.1 con métrica, Top N, origen, `ivaPct=0` oculto, gráfico horizontal por línea, métricas del período y tabla con remisiones valoradas.

**Archivo:** `src/views/pages/finanzas-y-administracion/informes/ventas/top-products-report.tsx`

- Tipo: `IReportResult<ITopProductRow, ITopProductTotals>`.
- Controles:
  - Métrica: Unidades / Kg / COP.
  - Top N: 5 / 10 / 20 / 50.
  - Origen: Todos / Siigo / Remisión.
  - `ivaPct=0` fijo y oculto.
- Gráfico `HorizontalBarChart`, color por `lineName`.
- Métricas del período (no del top): unidades, kg, venta neta, productos.
- Tabla:
  - Rank, Producto, Línea, Forma, Unidades, Kg, Venta neta, Líneas de remisión valoradas.
- Advertencias:
  - `SALE_DATE_IS_UPLOAD_DATE` como info.
  - `REMISSIONS_VALUED_AT_LIST_PRICE`.
  - `REMISSIONS_WITHOUT_PRICE`.
- La tabla muestra solo las filas del top; los totales cubren todo el período.
- No mostrar filtro de cliente (RG-17).

**Validación:**

- Cambiar métrica reordena y cambia la URL.
- Cambiar `top` limita filas pero no totales.
- `ivaPct=0` aparece en la petición de red.
- Exportación con los mismos parámetros.

---

### Tarea 10 — B-7, documentación y cierre

**Estado:** completada el 2026-10-20. Aviso B-7 en períodos CIF abiertos vencidos; `AGENTS.md` actualizado. `pnpm lint` limpio (solo warning preexistente), `tsc` solo 2 errores preexistentes, `pnpm test:run` 143 passed, `pnpm build` OK.

**Archivos:**

- `src/views/pages/finanzas-y-administracion/cif/period/detail.tsx`
- `AGENTS.md`

#### 10.1 B-7 en CIF

En `PeriodDetail`, antes de la tarjeta principal:

```tsx
const isOpenPastPeriod =
  period.status === "open" &&
  moment(period.endDate).isBefore(moment().startOf("month"));
```

Si `isOpenPastPeriod`:

```tsx
<Alert severity='warning'>
  Cierre este período para que los informes incluyan costos indirectos.
</Alert>
```

- Solo para períodos abiertos de meses anteriores.
- No mostrar para el mes actual.
- No modificar la lógica de cierre.

#### 10.2 `AGENTS.md`

Agregar:

- Ruta `/finanzas-y-administracion/informes` en la lista de rutas.
- Dominio `reports/` en la capa de API.
- Nota: los reportes usan Recharts con importación dinámica, no ApexCharts.
- Nota: pestaña, reporte y filtros viven en la URL; la barra usa `router.replace`.
- Nota: `registry.ts` es la fuente de verdad de reportes, endpoints y filtros.

No documentar mocks como parte de la ruta real.

#### 10.3 Validación final

Comandos:

```bash
pnpm lint
npx tsc --noEmit
pnpm test:run
```

Resultado esperado de `tsc`: solo los 2 errores preexistentes de:

- `src/views/pages/produccion/aprovisionamiento/__tests__/form.test.tsx`
- `src/views/pages/produccion/ordenes/__tests__/form.test.tsx`

Si aparece cualquier otro error, no se considera terminado.

Build sin tocar el `.next` del dev server:

```bash
rm -rf /tmp/opencode/naturex-build
rsync -a --exclude node_modules --exclude .next --exclude .git ./ /tmp/opencode/naturex-build/
ln -s "$PWD/node_modules" /tmp/opencode/naturex-build/node_modules
cd /tmp/opencode/naturex-build && pnpm build
```

No ejecutar `pnpm build` sobre el workspace mientras el dev server corre como `root`, porque `.next` es de `root`.

Pruebas manuales:

1. Login con rol administrador.
2. Ver la entrada de menú **Finanzas y administración › Informes**.
3. Abrir cada uno de los 5 reportes.
4. Recargar la URL y compartirla.
5. Cambiar pestaña/reporte y comprobar filtros conservados.
6. Validar 731/732 días y `from > to`.
7. Probar filtros multivalor y `"none"`.
8. Probar lote con debounce.
9. Exportar XLSX y CSV desde cada reporte.
10. Revisar estados vacío y error.
11. Revisar 1440, 1024 y 390 px; claro y oscuro.
12. Abrir un período CIF abierto de un mes anterior y ver el aviso B-7.
13. Iniciar sesión con un rol sin Informes y comprobar el bloqueo.
14. Confirmar que `/test/reportes` sigue funcionando.

No hacer commit.

---

## 7. Cobertura de requisitos

| Requisito | Dónde se implementa |
|---|---|
| UI-01 ubicación | `app/(dashboard)/finanzas-y-administracion/informes/page.tsx` |
| UI-02 pestañas | `tabs.tsx`, `REPORTS_BY_TAB` |
| UI-03 estado en URL | `params.ts`, `useReportUrl.ts`, `router.replace` |
| UI-04 sin permiso | gate server-side en `page.tsx` |
| UI-10 fecha y atajos | `date-range-filter.tsx` |
| UI-11 defaults | `createDefaultFilters` |
| UI-12 validación local | `validateFilters` |
| UI-13 filtros por reporte | `ReportEntry.filters`, `ReportFilterBar` |
| UI-14 selectores | `multi-select-filter.tsx`, catálogo |
| UI-15 lote debounce | `report-filter-bar.tsx` |
| UI-16 cliente | no se implementa |
| UI-17 limpiar | `report-filter-bar.tsx` |
| UI-18 chips | `active-filter-chips.tsx` |
| UI-20 estructura | `ReportCard` |
| UI-21 advertencias | `ReportWarnings` |
| UI-22 estados | `ReportError`, `EmptyState`, `isPending` |
| UI-23 formato | `format.ts` |
| UI-24 tabla | `ReportTable` |
| UI-25 tooltip/leyenda | charts |
| UI-26 colores | `colors.ts` |
| UI-27 responsive | MUI/Tailwind en filtros y tablas |
| R-1.1 a R-2.1 | componentes de reporte |
| UI-30 exportación | `exportReport`, `ExportButtons` |
| R-G2 exportación | `exportReport`, `ExportButtons` |
| B-7 | `cif/period/detail.tsx` |

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Endpoints `/api/reports/*` no existen aún | La ruta real queda cableada; validar visualmente con el prototipo. No agregar mocks a producción. |
| `/filters` no devuelve formulaciones/versiones | Selectores ocultos si no hay catálogo; documentar brecha. |
| `apiFetch` corta a 15 s | Las consultas deben responder < 3 s; exportación va por axios. |
| Caché con `Authorization` | La ruta es dinámica; verificar frescura y extender `apiFetch` solo si es necesario. |
| Peso de Recharts | Importación dinámica solo en Informes. |
| `Content-Disposition` no expuesto por ngrok | Fallback de nombre en `exportReport`. |
| Tabla con muchas órdenes | `maxHeight`, `stickyHeader` y scroll interno; no virtualizar en Etapa 1. |
| Suspense borra el gráfico anterior | `router.replace` dentro de `startTransition`; no usar `key` en el Suspense de filtros. |
| Filtros inválidos en URL compartida | `resolveReportSelection` devuelve `error` y no llama a la API. |
| Errores de API poco claros | `getReportServer` devuelve `{ data, error }` y `ReportError` muestra el mensaje. |
| `ivaPct` mal enviado | Se fuerza `0` para `top-products` en `toApiParams`. |
| Diferencia entre línea y `lotCategoryIds` | Mapeo explícito en `toApiParams`. |
| Tests nuevos no permitidos | Se ejecutan los existentes; se deja constancia de que §6.2 del contrato no se implementa en esta iteración. |

---

## 9. Fuera de alcance

- Backend, SQL, migraciones y Flyway.
- Etapas 2 y 3: tablero, costeo, metas, inventario, PDF.
- Filtro de cliente.
- Asignación FEFO.
- Mocks o flags en la ruta real.
- Nuevos archivos de test.
- Cambios en `next.config.mjs`.
- Commits.

---

## 10. Definición de terminado

- [ ] Prototipo aislado y `/test/reportes` sigue funcionando.
- [ ] `registry.ts` cubre los 5 reportes y sus filtros.
- [ ] `params.ts` valida fechas, top y minLossPct.
- [ ] `getReportServer` y `getReportFiltersServer` usan `apiFetch`.
- [ ] La página respeta permisos y URL.
- [ ] Los 5 reportes renderizan gráfico, tabla, totales y advertencias.
- [ ] Exportación XLSX/CSV funciona con los filtros activos.
- [ ] B-7 visible solo en períodos abiertos vencidos.
- [ ] `pnpm lint` pasa.
- [ ] `npx tsc --noEmit` no agrega errores nuevos.
- [ ] `pnpm test:run` pasa.
- [ ] Build en `/tmp/opencode/naturex-build` pasa.
- [ ] `AGENTS.md` actualizado.
- [ ] Sin commit.
