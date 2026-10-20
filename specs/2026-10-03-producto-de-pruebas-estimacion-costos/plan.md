# Producto dummy para simulación de costos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir simular el costo de una composición inexistente ("Producto de pruebas Naturex") agregando libremente filas de materia prima, empaque y ajustando el total de CIF, con todo el cálculo resuelto por el backend.

**Architecture:** Flujo paralelo al existente. `isTestProduct` en el listado de productos selecciona el modo; en ese modo cada cambio dispara `POST /api/costs/dummy-product/estimate` (sin persistir) y el frontend renderiza la respuesta. El cliente NO replica la matemática del backend — la única excepción es el override local del CIF. El camino del producto normal queda intacto.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, MUI v5, TanStack Query v5, react-hook-form + yup, vitest + @testing-library/react.

**Spec:** [`spec.md`](./spec.md) — adaptación frontend. Contrato autoritativo: [`spec-funtional.md`](./spec-funtional.md) (backend).

## Global Constraints

- **`apiFetch` es server-only. Nunca importarlo en un archivo `"use client"`.** `src/api/apiFetch.ts:9` llama `getServerSession` de `next-auth` y en `:37` pasa `next: { tags }` a `fetch` — las dos cosas son APIs de servidor. Para lecturas desde Client Components usar `API()` de `@/api/instances` (axios + interceptor de sesión), como ya hace `src/api/product/index.ts`. Para mutaciones, Server Actions con `apiFetch`.
- **Ids de material en las filas del dummy son `string`.** El backend los manda así (`MaterialUsed.idMaterial` es `String`) y los reales lo son (`P-001`, `F-1788841776`). Aplica solo a los tipos nuevos de este trabajo (`IDummySimulationRow`, `IMaterialPriceOption`, `DummyMaterialsPayload`); ver la nota de Task 1 Step 2 por qué `RegisterPricePayload` no se toca.
- **`isTestProduct` es nombre provisional.** concentrado en `ProductOption` y en la condición de `handleProductChange`; renombrarlo es un cambio de dos líneas si el backend elige otro.
- **El queryKey del listado de productos debe incluir los params.** `useGetProductList` tiene 12 consumidores con `["productList"]` compartido. Sin el param en la clave, el dummy se filtra a formulación, kardex, empaque y aprovisionamiento — lo que la spec upstream prohíbe explícitamente (§1).
- **El dummy se pide sin filtro `active=true`.** Se crea con `active=false` (spec upstream §2); con `active=true` no aparecería. `getProductList` no manda `active` en ningún caso.
- **Debounce por defecto: 400ms**, con descarte de respuestas tardías (punto abierto 2 de la spec — revisable sin tocar la arquitectura).
- **El precio de cada fila es editable** y se prellena con el del endpoint. Si viene `null`/`0` el campo queda vacío y el usuario lo tipea; una fila sin precio no se envía.
- **El cálculo es siempre del backend en modo dummy.** Ninguna tarea debe introducir aritmética de costos en el cliente, salvo el override de CIF.
- **`CostBreakdown` conserva su `useEffect` y su `eslint-disable` para el camino normal.** Ese effect (`CostBreakdown.tsx:118-129`) agrega los totales de las dos tablas en `realTotalCostFeedstock` / `realTotalCostPackaging`; sin él el producto normal deja de recalcular al editar cantidades (decisión 9 y QA 1.3). Solo se salta cuando `isTestProduct` es true.
- **Componentes MUI: usar los wrappers de `@/@core/components/mui/`** (`CustomTextField`, `CustomButton`, `CustomIconButton`, `CustomCard`), no los de `@mui/material` — es la convención del módulo (ver `CostBreakdown.tsx:7` y `RegisterPriceCard.tsx:9-10`).
- **Prettier:** double quotes, semicolons, 120 width, sin trailing commas, `arrowParens: avoid`, `jsxSingleQuote: true`.
- **ESLint:** import order react → next → external → `@/`; `consistent-type-imports: error`; `no-unused-vars: error`.
- **Server Actions** (mutaciones en `src/api/<domain>/actions.ts`) usan `"use server"` + `apiFetch` + `revalidateTag()`, y devuelven `{ success, error? }` — nunca lanzan hacia la UI.
- **Info messages** con `<Alert severity='...'>` de MUI, no combinations de Box/Icon.
- **Sin HTML anidado en `<Typography>`** — usar `<Stack direction='row' spacing={1}>`.
- **Los iconos se resuelven en runtime vía `@iconify/react`.** `generated-icons.css` está vacío de `mdi:*` y sin embargo `mdi:alert-circle-outline` y `mdi:content-save-outline` ya se usan en este módulo y renderizan. Los `mdi:*` nuevos de este plan (`plus`, `trash-can-outline`, `restore`) no necesitan `pnpm build:icons`.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/types/pages/costs.ts` | Tipos del dominio de costos. Gana `unitGramsFinalProductUsed`, `isDraft`, `IDummySimulationRow`, `IMaterialPriceOption`. |
| `src/utils/schemas/costs.ts` | yup del form. Gana `dummySimulationSchema`. |
| `src/utils/costs.ts` | Puro: `createEmptySimulation`, `buildDummyMaterialsPayload`, `isDummyRowComplete`. |
| `src/api/costs/actions.ts` | Server Actions: `estimateDummyProductAction`, `saveDummyProductAction`, `updateDummySnapshotAction`. |
| `src/api/costs/prices.ts` | Lecturas **client** (axios) de los precios de referencia (`/costs/feedstock/list`, `/costs/packaging/list`). |
| `src/api/costs/server.ts` | Ya tiene `getCostConfigServer()` (RSC). No se modifica — el cliente usa `useCostConfig` con axios. |
| `src/api/product/index.ts` | `getProductList` parametrizado. |
| `src/hooks/product/useGetProductList.ts` | React Query con queryKey por params. |
| `src/hooks/costs/useCostConfig.ts` | **Nuevo.** React Query de `costs/config` vía axios (no existía en cliente). |
| `src/hooks/costs/useMaterialPrices.ts` | **Nuevo.** React Query de los dos endpoints de precio. |
| `src/hooks/costs/useEstimate.ts` | Dueño del estado del estimate: modo, filas, debounce, override de CIF. |
| `src/hooks/costs/useDebouncedEstimate.ts` | **Nuevo.** Debounce 400ms + descarte de respuestas tardías. |
| `src/views/.../costos/estimate/EstimateForm.tsx` | Selector de producto + inputs de unidades y gramos. |
| `src/views/.../costos/estimate/MaterialRow.tsx` | **Nuevo.** Fila: precio editable, cantidad, borrar. |
| `src/views/.../costos/estimate/CostBreakdown.tsx` | Tablas condicionales, filas agregables; el `useEffect` se conserva solo para el camino normal. |
| `src/views/.../costos/estimate/CostSummaryCards.tsx` | CIF editable + valor con piso de 100g. |
| `src/views/.../costos/estimate/index.tsx` | Ocultar precio actual e historial de precios en modo dummy. |
| `src/utils/__tests__/costs.test.ts` | **Nuevo.** Tests de las funciones puras. |
| `src/hooks/product/__tests__/useGetProductList.test.ts` | **Nuevo.** Aislamiento de queryKey. |
| `src/hooks/costs/__tests__/useDebouncedEstimate.test.ts` | **Nuevo.** Debounce y descarte de respuestas tardías. |

---

### Task 1: Tipos y Server Actions del contrato dummy

**Files:**
- Modify: `src/types/pages/costs.ts`
- Modify: `src/api/costs/actions.ts`
- Create: `src/api/costs/prices.ts`

**Interfaces:**
- Consumes: nada (tarea base).
- Produces:
  - `unitGramsFinalProductUsed: number | null` en `ICostEstimate`.
  - `isDraft?: boolean` en `ICostEstimateMaterial`.
  - `IDummySimulationRow`, `IMaterialPriceOption`, `DummyEstimatePayload`, `DummyMaterialsPayload` en `src/types/pages/costs.ts`.
  - `estimateDummyProductAction(payload: DummyEstimatePayload)`, `saveDummyProductAction(payload: DummyEstimatePayload)`, `updateDummySnapshotAction(snapshotId: number, payload: DummyEstimatePayload)`.
  - `getFeedstockPrices(): Promise<IMaterialPriceOption[]>`, `getPackagingPrices(): Promise<IMaterialPriceOption[]>` (axios, client-side).

- [ ] **Step 1: Agregar los tipos a `src/types/pages/costs.ts`**

Al final del archivo, agregar:

```ts
export interface IMaterialPriceOption {
  id: string;
  name: string;
  pricePerGram: number | null;
  pricePerUnit: number | null;
}

export type IDummySimulationRow = {
  localId: string;
  materialType: "feedstock" | "packaging";
  idMaterial: string;
  materialName: string;
  unitCost: number | string;
  quantity: number | string;
  isDraft: boolean;
};

export type DummyMaterialsPayload = {
  idMaterial: string;
  materialType: string;
  quantity: number;
  unitCost: number;
}[];

export type DummyEstimatePayload = {
  unitGramsFinalProduct: number;
  units: number;
  wastePct: number;
  commissionPct: number;
  finalPrice: number;
  isDefinitive: boolean;
  notes: string;
  materials: DummyMaterialsPayload;
};
```

Y en la interface `ICostEstimate`, agregar junto a `unitGramsFinalProduct: number | null;`:

```ts
  unitGramsFinalProductUsed: number | null;
```

En `ICostEstimateMaterial`, agregar al final: `isDraft?: boolean;`. `ICostEstimateCifDetail` **no** se toca: las filas de CIF nunca son editables (spec §"Sobre las filas de CIF").

- [ ] **Step 2: Agregar el import de los tipos nuevos**

En `src/api/costs/actions.ts`, extender la línea 6:

```ts
import type {
  DummyEstimatePayload,
  ICostEstimate,
  IProductInventorySummary,
  IProductPrice,
  IPutCostConfig
} from "@/types/pages/costs";
```

**No tocar `RegisterPricePayload`.** Sus `materials` son `RegisterPriceMaterialInput[]` (`idMaterial: number`, `quantity: number | string`, `unitCost: number | null`) y los consume `useEstimate.ts:152` vía `values.materials` del form normal. Reemplazarlo por `DummyMaterialsPayload` rompe el guardado del producto normal (decisión 9). El payload dummy es un tipo aparte.

> La inconsistencia preexistente `idMaterial: number` en `RegisterPricePayload` vs `yup.string()` en `registerPriceSchema` (`src/utils/schemas/costs.ts:60`) queda como está: está fuera de alcance y funciona hoy porque los ids reales viajan como string en el JSON.

- [ ] **Step 3: Agregar las tres Server Actions**

Al final de `src/api/costs/actions.ts`, agregar:

```ts
export async function estimateDummyProductAction(
  payload: DummyEstimatePayload
): Promise<{ success: true; data: ICostEstimate } | { success: false; error: string }> {
  try {
    const data = await apiFetch<ICostEstimate>("costs/dummy-product/estimate", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function saveDummyProductAction(payload: DummyEstimatePayload): Promise<ActionResult> {
  try {
    await apiFetch("costs/dummy-product/save", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateDummySnapshotAction(snapshotId: number, payload: DummyEstimatePayload): Promise<ActionResult> {
  try {
    await apiFetch(`costs/dummy-product/snapshot/${snapshotId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

- [ ] **Step 4: Crear `src/api/costs/prices.ts`**

Estos endpoints se consumen desde un Client Component, así que van por **axios** (`API()`), no por `apiFetch`. Ver la restricción de Global Constraints sobre `apiFetch`.

```ts
import { API } from "@/api/instances";
import type { IMaterialPriceOption } from "@/types/pages/costs";

export const getFeedstockPrices = async (): Promise<IMaterialPriceOption[]> => {
  const response = await API().get("/costs/feedstock/list");

  return response.data;
};

export const getPackagingPrices = async (): Promise<IMaterialPriceOption[]> => {
  const response = await API().get("/costs/packaging/list");

  return response.data;
};
```

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos. Este es el único punto donde se tocan tipos compartidos, así que es el primer lugar donde aparecería un error si `ICostEstimate` necesita más campos.

- [ ] **Step 6: Commit**

```bash
git add src/types/pages/costs.ts src/api/costs/actions.ts src/api/costs/prices.ts
git commit -m "feat(costs): tipos y server actions del flujo dummy"
```

---

### Task 2: Query param `includeTestProducts` con queryKey aislada

**Files:**
- Modify: `src/api/product/index.ts:52-56`
- Modify: `src/hooks/product/useGetProductList.ts`
- Create: `src/hooks/product/__tests__/useGetProductList.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `getProductList(params?: { includeTestProducts?: boolean })`, `useGetProductList(params?: { includeTestProducts?: boolean })`. El queryKey resultante es `["productList", params]`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/hooks/product/__tests__/useGetProductList.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

const getProductList = vi.fn();

vi.mock("@/api/product", () => ({ getProductList: (...args: any[]) => getProductList(...args) }));

import useGetProductList from "@/hooks/product/useGetProductList";

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return createElement(QueryClientProvider, { client: qc }, children);
};

describe("useGetProductList", () => {
  beforeEach(() => {
    getProductList.mockReset();
    getProductList.mockResolvedValue([]);
  });

  it("no pide el dummy cuando no se pasan params", async () => {
    const { result } = renderHook(() => useGetProductList(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getProductList).toHaveBeenCalledWith(undefined);
  });

  it("pide el dummy cuando se pasa includeTestProducts", async () => {
    const { result } = renderHook(() => useGetProductList({ includeTestProducts: true }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getProductList).toHaveBeenCalledWith({ includeTestProducts: true });
  });

  it("usa queryKeys distintas segun los params para no contaminar la cache", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useGetProductList(), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: qc }, children)
    });
    renderHook(() => useGetProductList({ includeTestProducts: true }), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: qc }, children)
    });

    await waitFor(() => expect(qc.getQueryData(["productList", undefined])).toBeDefined());
    expect(qc.getQueryData(["productList", { includeTestProducts: true }])).toBeDefined();
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm vitest run src/hooks/product/__tests__/useGetProductList.test.ts`
Expected: FAIL — `getProductList` no acepta argumentos y el queryKey no incluye los params.

- [ ] **Step 3: Parametrizar `getProductList`**

En `src/api/product/index.ts`, reemplazar las líneas 52-56:

```ts
export const getProductList = async (params?: { includeTestProducts?: boolean }) => {
  const response = await API().get("/product/list", { params });

  return response.data;
};
```

- [ ] **Step 4: Parametrizar el hook con params en el queryKey**

Reemplazar `src/hooks/product/useGetProductList.ts` completo:

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { getProductList } from "@/api/product";

type ProductListParams = { includeTestProducts?: boolean };

const useGetProductList = (params?: ProductListParams) => {
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["productList", params],
    queryFn: () => getProductList(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  return {
    productList: data ?? [],
    isLoading: isLoading || isFetching,
    error
  };
};

export default useGetProductList;
```

- [ ] **Step 5: Correr el test para verificar que pasa**

Run: `pnpm vitest run src/hooks/product/__tests__/useGetProductList.test.ts`
Expected: PASS — 3 tests.

- [ ] **Step 6: Verificar que los otros consumidores siguen compilando**

Run: `npx tsc --noEmit`
Expected: sin errores. Los 11 consumidores que llaman `useGetProductList()` sin argumentos siguen válidos porque el parámetro es opcional.

- [ ] **Step 7: Commit**

```bash
git add src/api/product/index.ts src/hooks/product/useGetProductList.ts src/hooks/product/__tests__/useGetProductList.test.ts
git commit -m "feat(product): param includeTestProducts con queryKey aislada"
```

---

### Task 3: Funciones puras de la simulación

**Files:**
- Create: `src/utils/__tests__/costs.test.ts`
- Modify: `src/utils/costs.ts`

**Interfaces:**
- Consumes: `IDummySimulationRow`, `DummyMaterialsPayload` de Task 1.
- Produces:
  - `createEmptySimulation(product: { id: string; isTestProduct?: boolean }, config?: Partial<ICostConfig>): ICostEstimate`
  - `buildDummyMaterialsPayload(rows: IDummySimulationRow[]): DummyMaterialsPayload`
  - `isDummyRowComplete(row: IDummySimulationRow): boolean`
  - `applyCifOverride(estimate: ICostEstimate, override: number | null): ICostEstimate`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/utils/__tests__/costs.test.ts`:

```ts
import { describe, it, expect } from "vitest";

import {
  createEmptySimulation,
  buildDummyMaterialsPayload,
  isDummyRowComplete,
  applyCifOverride
} from "@/utils/costs";

const config = { cifAveragingMonths: 3, defaultWastePct: 5, defaultMarginPct: 30 };

describe("createEmptySimulation", () => {
  it("devuelve un estimate con todos los montos en cero y listas vacias", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.totalCost).toBe(0);
    expect(sim.totalCif).toBe(0);
    expect(sim.realTotalCostFeedstock).toBe(0);
    expect(sim.realTotalCostPackaging).toBe(0);
    expect(sim.materials).toEqual([]);
    expect(sim.cifDetails).toEqual([]);
    expect(sim.periods).toEqual([]);
  });

  it("hereda wastePct y el margen del config en el nivel superior", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.wastePct).toBe(5);
    expect(sim.defaultMarginPct).toBe(30);
  });

  it("no deja ningun monto en undefined ni NaN", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);
    const numeric = Object.entries(sim).filter(([, v]) => typeof v === "number") as [string, number][];

    expect(numeric.length).toBeGreaterThan(10);

    numeric.forEach(([key, value]) => {
      expect(Number.isFinite(value), `${key} es ${value}`).toBe(true);
    });

    Object.entries(sim.price).forEach(([key, value]) => {
      if (value === null) return;

      expect(Number.isFinite(value as number), `price.${key} es ${value}`).toBe(true);
    });
  });

  it("usa divisors distintos de cero para que el summary no muestre NaN", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.quantityKg).toBeGreaterThan(0);
    expect(sim.units).toBeGreaterThan(0);
  });

  it("funciona sin config para no depender del timing del useQuery", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true });

    expect(sim.wastePct).toBe(0);
    expect(sim.defaultMarginPct).toBe(0);
    expect(sim.price.suggestedPrice).toBe(0);
  });

  it("deja unitGramsFinalProductUsed disponible para el piso de 100g", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.unitGramsFinalProductUsed).toBeNull();
  });
});

describe("isDummyRowComplete", () => {
  const base = {
    localId: "r1",
    materialType: "feedstock" as const,
    idMaterial: "F-1",
    materialName: "Glicina",
    unitCost: 0.5,
    quantity: 100,
    isDraft: true
  };

  it("una fila con material, precio y cantidad esta completa", () => {
    expect(isDummyRowComplete(base)).toBe(true);
  });

  it("una fila sin precio NO esta completa", () => {
    expect(isDummyRowComplete({ ...base, unitCost: "" })).toBe(false);
  });

  it("una fila con precio cero NO esta completa", () => {
    expect(isDummyRowComplete({ ...base, unitCost: 0 })).toBe(false);
  });

  it("una fila sin cantidad NO esta completa", () => {
    expect(isDummyRowComplete({ ...base, quantity: "" })).toBe(false);
  });
});

describe("buildDummyMaterialsPayload", () => {
  it("mapea filas completas al shape que espera el backend", () => {
    const rows = [
      {
        localId: "r1",
        materialType: "feedstock" as const,
        idMaterial: "F-1",
        materialName: "Glicina",
        unitCost: "0.5",
        quantity: "100",
        isDraft: true
      },
      {
        localId: "r2",
        materialType: "packaging" as const,
        idMaterial: "P-2",
        materialName: "Envase",
        unitCost: 0.25,
        quantity: 2,
        isDraft: true
      }
    ];

    expect(buildDummyMaterialsPayload(rows)).toEqual([
      { idMaterial: "F-1", materialType: "feedstock", quantity: 100, unitCost: 0.5 },
      { idMaterial: "P-2", materialType: "packaging", quantity: 2, unitCost: 0.25 }
    ]);
  });

  it("descarta las filas incompletas en vez de mandar null", () => {
    const rows = [
      {
        localId: "r1",
        materialType: "feedstock" as const,
        idMaterial: "F-1",
        materialName: "Glicina",
        unitCost: "",
        quantity: "100",
        isDraft: true
      }
    ];

    expect(buildDummyMaterialsPayload(rows)).toEqual([]);
  });
});

describe("applyCifOverride", () => {
  const base = {
    totalCif: 200,
    realCostMaterialUnit: 100,
    totalCost: 300
  } as any;

  it("sin override deja el total como estaba", () => {
    const out = applyCifOverride(base, null);

    expect(out.totalCif).toBe(200);
    expect(out.totalCost).toBe(300);
  });

  it("con override recalcula totalCost usando el CIF efectivo", () => {
    const out = applyCifOverride(base, 500);

    expect(out.totalCost).toBe(600);
    expect(out.totalCif).toBe(500);
  });

  it("no muta el estimate original", () => {
    applyCifOverride(base, 500);

    expect(base.totalCost).toBe(300);
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

Run: `pnpm vitest run src/utils/__tests__/costs.test.ts`
Expected: FAIL — las cuatro funciones no existen.

- [ ] **Step 3: Implementar en `src/utils/costs.ts`**

Agregar el import en la línea 1, junto al de `ICostEstimate`:

```ts
import type {
  DummyMaterialsPayload,
  ICostConfig,
  ICostEstimate,
  IDummySimulationRow
} from "@/types/pages/costs";
```

> `createEmptySimulation` devuelve un `ICostEstimate` completo y sin casts: el shape de `price` es exactamente el de `IProductPrice` (`src/types/pages/costs.ts:88-112`), y `defaultMarginPct` / `defaultMarginValue` / `taxValue` / `costDifference` / `utilityPct` van al nivel superior porque es ahí donde los lee la UI (`CostSummaryCards.tsx:62`, `RegisterPriceCard.tsx:66`). `config` es opcional para que la simulación vacía exista desde el primer render, sin esperar al useQuery de `costs/config`.

Al final del archivo, agregar:

```ts
export const createEmptySimulation = (
  product: { id: string; isTestProduct?: boolean },
  config?: Partial<ICostConfig>
): ICostEstimate => {
  const now = new Date().toISOString();

  return {
    id: null,
    idFinalProduct: product.id,
    idOrder: null,
    idVersion: 1,
    snapshotType: "estimation",
    status: "draft",
    units: 1,
    quantityKg: 1,
    unitGramsFinalProduct: null,
    unitGramsFinalProductUsed: null,
    realTotalCostFeedstock: 0,
    realTotalCostPackaging: 0,
    realCostMaterialUnit: 0,
    costCifKg: 0,
    wastePct: config?.defaultWastePct ?? 0,
    cifPeriodsUsed: 0,
    dateSnapshot: now,
    nameUser: "",
    notes: null,
    materials: [],
    periods: [],
    cifDetails: [],
    totalCif: 0,
    price: {
      id: 0,
      idFinalProduct: product.id,
      idSnapshot: null,
      commissionPct: 0,
      commissionValue: null,
      suggestedPrice: 0,
      utilityPct: 0,
      costBase: 0,
      costDifference: 0,
      wastePct: 0,
      taxPct: 0,
      costWithWaste: 0,
      wasteAmount: 0,
      costWithTax: 0,
      finalPrice: 0,
      marginPct: 0,
      marginAmount: 0,
      marginWarning: false,
      effectiveFrom: null,
      effectiveTo: null,
      nameUser: null,
      dateCreated: now,
      notes: null
    },
    totalCost: 0,
    totalCostTax: 0,
    totalCostWaste: 0,
    wasteValue: 0,
    taxValue: 0,
    defaultMarginValue: 0,
    defaultMarginPct: config?.defaultMarginPct ?? 0,
    costDifference: 0,
    utilityPct: 0
  };
};

const toNumber = (value: number | string): number => {
  const n = typeof value === "number" ? value : parseFloat(value);

  return Number.isFinite(n) ? n : 0;
};

export const isDummyRowComplete = (row: IDummySimulationRow): boolean =>
  Boolean(row.idMaterial) && toNumber(row.unitCost) > 0 && toNumber(row.quantity) > 0;

export const buildDummyMaterialsPayload = (rows: IDummySimulationRow[]): DummyMaterialsPayload =>
  rows.filter(isDummyRowComplete).map(row => ({
    idMaterial: row.idMaterial,
    materialType: row.materialType,
    quantity: toNumber(row.quantity),
    unitCost: toNumber(row.unitCost)
  }));

export const applyCifOverride = (estimate: ICostEstimate, override: number | null): ICostEstimate => {
  if (override === null) return estimate;

  const effectiveCif = override;

  return {
    ...estimate,
    totalCif: effectiveCif,
    totalCost: estimate.realCostMaterialUnit + effectiveCif
  };
};
```

**Nota:** `applyCifOverride` devuelve una copia superficial — `totalCif` y `totalCost` quedan overridden en el objeto devuelto, pero `price` sigue siendo la referencia original. Es intencional: el override no debe tocar el precio que devuelve el backend (punto abierto 3).

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `pnpm vitest run src/utils/__tests__/costs.test.ts`
Expected: PASS — 16 tests (6 de `createEmptySimulation`, 4 de `isDummyRowComplete`, 2 de `buildDummyMaterialsPayload`, 3 de `applyCifOverride`, 1 de `toNumber` indirecto).

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/utils/costs.ts src/utils/__tests__/costs.test.ts
git commit -m "feat(costs): funciones puras de la simulacion dummy"
```

---

### Task 4: Hooks de config y precios de referencia

**Files:**
- Create: `src/hooks/costs/useCostConfig.ts`
- Create: `src/hooks/costs/useMaterialPrices.ts`

**Interfaces:**
- Consumes: `IMaterialPriceOption`, `getFeedstockPrices`, `getPackagingPrices` de Task 1.
- Produces:
  - `useCostConfig(): { costConfig: ICostConfig | null; isLoading: boolean }`
  - `useMaterialPrices(): { feedstockPrices: IMaterialPriceOption[]; packagingPrices: IMaterialPriceOption[]; isLoading: boolean }`

- [ ] **Step 1: Crear `src/hooks/costs/useCostConfig.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { API } from "@/api/instances";
import type { ICostConfig } from "@/types/pages/costs";

const useCostConfig = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cost-config"],
    queryFn: async () => {
      const response = await API().get("/costs/config");

      return response.data as ICostConfig;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  return {
    costConfig: data ?? null,
    isLoading: isLoading || isFetching
  };
};

export default useCostConfig;
```

- [ ] **Step 2: Crear `src/hooks/costs/useMaterialPrices.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { getFeedstockPrices, getPackagingPrices } from "@/api/costs/prices";

const useMaterialPrices = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cost-material-prices"],
    queryFn: async () => {
      const [feedstock, packaging] = await Promise.all([getFeedstockPrices(), getPackagingPrices()]);

      return { feedstock, packaging };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  return {
    feedstockPrices: data?.feedstock ?? [],
    packagingPrices: data?.packaging ?? [],
    isLoading: isLoading || isFetching
  };
};

export default useMaterialPrices;
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores. (Se pueden omitir los steps que hablaban de "mover a Server Actions/envueltas" — ya no aplican porque `apiFetch` no se usa en cliente).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/costs/useCostConfig.ts src/hooks/costs/useMaterialPrices.ts
git commit -m "feat(costs): hooks de config y precios de referencia"
```

---

### Task 5: Debounce con cancelación de requests en vuelo

**Files:**
- Create: `src/hooks/costs/useDebouncedEstimate.ts`
- Create: `src/hooks/costs/__tests__/useDebouncedEstimate.test.ts`

**Interfaces:**
- Consumes: `DummyEstimatePayload`, `ICostEstimate` de Task 1; `estimateDummyProductAction` de Task 1.
- Produces:
  - `useDebouncedEstimate(): { estimate: ICostEstimate | null; isEstimating: boolean; error: string | null; runEstimate: (payload: DummyEstimatePayload) => void; reset: () => void }`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/hooks/costs/__tests__/useDebouncedEstimate.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const estimateDummyProductAction = vi.fn();

vi.mock("@/api/costs/actions", () => ({
  estimateDummyProductAction: (...args: any[]) => estimateDummyProductAction(...args)
}));

import useDebouncedEstimate from "@/hooks/costs/useDebouncedEstimate";

const payload = {
  unitGramsFinalProduct: 100,
  units: 1,
  wastePct: 0,
  commissionPct: 0,
  finalPrice: 10,
  isDefinitive: false,
  notes: "",
  materials: []
};

describe("useDebouncedEstimate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    estimateDummyProductAction.mockReset();
    estimateDummyProductAction.mockResolvedValue({ success: true, data: { totalCost: 42 } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no dispara el request antes del debounce", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));
    expect(estimateDummyProductAction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    await waitFor(() => expect(estimateDummyProductAction).toHaveBeenCalledTimes(1));
  });

  it("colapsa varias llamadas seguidas en un solo request", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => {
      result.current.runEstimate(payload);
      result.current.runEstimate(payload);
      result.current.runEstimate(payload);
    });

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    await waitFor(() => expect(estimateDummyProductAction).toHaveBeenCalledTimes(1));
  });

  it("guarda el estimate devuelto", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.estimate).toEqual({ totalCost: 42 }));
  });

  it("expone el error sin romper", async () => {
    estimateDummyProductAction.mockResolvedValue({ success: false, error: "Boom" });

    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.error).toBe("Boom"));
    expect(result.current.estimate).toBeNull();
  });

  it("reset limpia el estado y cancela el timer pendiente", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));
    act(() => result.current.reset());
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(estimateDummyProductAction).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm vitest run src/hooks/costs/__tests__/useDebouncedEstimate.test.ts`
Expected: FAIL — el hook no existe.

- [ ] **Step 3: Implementar el hook**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { estimateDummyProductAction } from "@/api/costs/actions";
import type { DummyEstimatePayload, ICostEstimate } from "@/types/pages/costs";

const DEBOUNCE_MS = 400;

export const useDebouncedEstimate = () => {
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<DummyEstimatePayload | null>(null);
  const inflightIdRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      inflightIdRef.current++;
    },
    []
  );

  const runEstimate = useCallback((payload: DummyEstimatePayload) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    latestPayloadRef.current = payload;
    setIsEstimating(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      const currentId = ++inflightIdRef.current;
      const p = latestPayloadRef.current;

      if (!p) return;

      const result = await estimateDummyProductAction(p);

      if (inflightIdRef.current !== currentId) return;

      setIsEstimating(false);

      if (result.success) {
        setEstimate(result.data);
      } else {
        setEstimate(null);
        setError(result.error);
      }
    }, DEBOUNCE_MS);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    latestPayloadRef.current = null;
    inflightIdRef.current++;
    setEstimate(null);
    setError(null);
    setIsEstimating(false);
  }, []);

  return { estimate, isEstimating, error, runEstimate, reset };
};

export default useDebouncedEstimate;
```

**Nota sobre descarte de respuestas tardías:** `apiFetch` no acepta `signal`, por eso se usa un `inflightIdRef` (reemplaza AbortController): si hay una nueva llamada, cualquier respuesta de requests anteriores se ignora. Esto es suficiente para el caso 3.13 del QA.

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `pnpm vitest run src/hooks/costs/__tests__/useDebouncedEstimate.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/costs/useDebouncedEstimate.ts src/hooks/costs/__tests__/useDebouncedEstimate.test.ts
git commit -m "feat(costs): debounce de estimate con descarte de respuestas tardias"
```

---

### Task 6: Estado del modo dummy en `useEstimate`

**Files:**
- Modify: `src/hooks/costs/useEstimate.ts`

**Interfaces:**
- Consumes: `createEmptySimulation`, `buildDummyMaterialsPayload` (Task 3); `useCostConfig` (Task 4); `useDebouncedEstimate` (Task 5); `useGetProductList` (Task 2); `saveDummyProductAction`, `updateDummySnapshotAction` (Task 1).
- Produces (campos y handlers nuevos del return de `useEstimate`):
  - `isTestProduct: boolean`
  - `units: number`, `unitGramsFinalProduct: number | string`
  - `dummyRows: IDummySimulationRow[]`
  - `cifOverride: number | null`, `effectiveCif: number`
  - `isDummyEstimating: boolean`, `dummyEstimateError: string | null`
  - `handleAddRow(materialType: "feedstock" | "packaging", option: IMaterialPriceOption)`
  - `handleRemoveRow(localId: string)`
  - `handleRowChange(localId: string, field: "unitCost" | "quantity", value: number | string)`
  - `handleUnitsChange(v)`, `handleGramsChange(v)`
  - `handleCifOverrideChange(v)`, `handleCifOverrideReset()`
  - `handleRegisterDummyPrice()`

- [ ] **Step 1: Agregar los imports**

Al inicio de `src/hooks/costs/useEstimate.ts`, agregar:

```ts
import useCostConfig from "@/hooks/costs/useCostConfig";
import useDebouncedEstimate from "@/hooks/costs/useDebouncedEstimate";
import {
  saveDummyProductAction,
  updateDummySnapshotAction
} from "@/api/costs/actions";
import {
  createEmptySimulation,
  buildDummyMaterialsPayload,
  applyCifOverride
} from "@/utils/costs";
import type { IDummySimulationRow, IMaterialPriceOption } from "@/types/pages/costs";
```

- [ ] **Step 2: Extender `ProductOption`**

Reemplazar el type por:

```ts
export type ProductOption = {
  id: string;
  fullName?: string;
  name?: string;
  isTestProduct?: boolean;
};
```

- [ ] **Step 3: Agregar el estado nuevo**

Después de `const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);` agregar:

```ts
const { costConfig } = useCostConfig();
const { estimate: dummyEstimate, isEstimating: isDummyEstimating, error: dummyEstimateError, runEstimate, reset: resetDummyEstimate } =
  useDebouncedEstimate();

const [dummyRows, setDummyRows] = useState<IDummySimulationRow[]>([]);
const [cifOverride, setCifOverride] = useState<number | null>(null);
const [units, setUnits] = useState<number | string>(1);
const [unitGramsFinalProduct, setUnitGramsFinalProduct] = useState<number | string>(100);

const isTestProduct = Boolean(selectedProduct?.isTestProduct);
const effectiveCif = cifOverride ?? estimate?.totalCif ?? 0;
```

- [ ] **Step 4: Bifurcar `handleProductChange`**

Reemplazar el body de `handleProductChange` por:

```ts
const handleProductChange = (product: ProductOption | null) => {
  setSelectedProduct(product);
  setEstimate(null);
  methods.reset();
  setError(null);
  setDummyRows([]);
  setCifOverride(null);
  resetDummyEstimate();

  if (!product?.id) return;

  if (product.isTestProduct) {
    setEstimate(costConfig ? createEmptySimulation(product, costConfig) : null);
  } else {
    handleEstimate(product.id);
  }
};
```

El reset de `cifOverride` y `dummyRows` es lo que impide que el estado de una simulación se filtre al producto siguiente (QA 5.5).

- [ ] **Step 5: Agregar los handlers de filas**

Después de `handleEstimate`, agregar:

```ts
const rowPriceFor = (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) =>
  materialType === "feedstock" ? option.pricePerGram : option.pricePerUnit;

const pushDummyEstimate = useCallback(() => {
  const grams = typeof unitGramsFinalProduct === "number" ? unitGramsFinalProduct : parseFloat(unitGramsFinalProduct);
  const unitCount = typeof units === "number" ? units : parseFloat(units);

  if (!Number.isFinite(grams) || grams <= 0 || !Number.isFinite(unitCount) || unitCount <= 0) return;
  if (buildDummyMaterialsPayload(dummyRows).length === 0) return;

  runEstimate({
    unitGramsFinalProduct: grams,
    units: Math.floor(unitCount),
    wastePct: Number(methods.getValues("wastePct")) || 0,
    commissionPct: Number(methods.getValues("comissionPct")) || 0,
    finalPrice: Number(methods.getValues("finalPrice")) || 0,
    isDefinitive: false,
    notes: methods.getValues("priceNotes") || "",
    materials: buildDummyMaterialsPayload(dummyRows)
  });
}, [dummyRows, unitGramsFinalProduct, units, methods, runEstimate]);

const handleAddRow = (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) => {
  const price = rowPriceFor(materialType, option);

  setDummyRows(prev => [
    ...prev,
    {
      localId: `${materialType}-${option.id}-${Date.now()}`,
      materialType,
      idMaterial: option.id,
      materialName: option.name,
      unitCost: price && price > 0 ? price : "",
      quantity: "",
      isDraft: true
    }
  ]);
};

const handleRemoveRow = (localId: string) => {
  setDummyRows(prev => prev.filter(r => r.localId !== localId));
};

const handleRowChange = (localId: string, field: "unitCost" | "quantity", value: number | string) => {
  setDummyRows(prev => prev.map(r => (r.localId === localId ? { ...r, [field]: value } : r)));
};
```

Agregar el effect que dispara el estimate cuando las filas quedan completas:

```ts
useEffect(() => {
  if (!isTestProduct) return;
  pushDummyEstimate();
}, [dummyRows, isTestProduct]);
```

- [ ] **Step 6: Agregar los handlers de unidades, gramos y CIF**

```ts
const handleUnitsChange = (value: number | string) => setUnits(value);
const handleGramsChange = (value: number | string) => setUnitGramsFinalProduct(value);

const handleCifOverrideChange = (value: number | null) => {
  setCifOverride(value === null || !Number.isFinite(value) || value < 0 ? null : value);
};

const handleCifOverrideReset = () => setCifOverride(null);
```

- [ ] **Step 7: Agregar el guardado dummy**

```ts
const handleRegisterDummyPrice = methods.handleSubmit(async (values: RegisterPriceFormValues) => {
  const grams = typeof unitGramsFinalProduct === "number" ? unitGramsFinalProduct : parseFloat(unitGramsFinalProduct);
  const unitCount = typeof units === "number" ? units : parseFloat(units);
  const materials = buildDummyMaterialsPayload(dummyRows);

  if (materials.length === 0) {
    toast.error("Agregue al menos un material con precio y cantidad");

    return;
  }

  const payload = {
    unitGramsFinalProduct: grams,
    units: Math.floor(unitCount),
    wastePct: values.wastePct,
    commissionPct: values.comissionPct,
    finalPrice: values.finalPrice,
    isDefinitive: values.isDefinitive,
    notes: values.priceNotes,
    materials
  };

  startPriceTransition(async () => {
    const result =
      snapshotId !== null
        ? await updateDummySnapshotAction(snapshotId, payload)
        : await saveDummyProductAction(payload);

    if (result.success) {
      toast.success("Simulación guardada con éxito");
      queryClient.invalidateQueries({ queryKey: ["product-snapshots"] });
      onSaved?.();
    } else {
      toast.error(result.error || "Error al guardar la simulación");
    }
  });
});
```

- [ ] **Step 8: Aplicar el override en `derivedEstimate` y extender el return**

Reemplazar el `derivedEstimate` por:

```ts
const derivedEstimate = useMemo(() => {
  if (!estimate) return dummyEstimate;

  const base = applyCifOverride(estimate, isTestProduct ? cifOverride : null);

  const totalCost = base.realTotalCostFeedstock + base.realTotalCostPackaging + base.totalCif;
  const price = Number(finalPrice);
  const costDifference = price > 0 ? price - base.totalCostWaste : 0;
  const utilityPct = price > 0 ? (costDifference / price) * 100 : 0;
  const wasteValue = totalCost * (wastePct / 100);
  const commissionValue = price * (commissionPct / 100);
  const defaultMarginValue = (base.totalCostWaste * 0.4) / 0.6;

  return {
    ...base,
    totalCost,
    wasteValue,
    wastePct,
    costDifference,
    utilityPct,
    defaultMarginValue,
    price: { ...base.price, commissionPct, commissionValue }
  };
}, [estimate, dummyEstimate, cifOverride, isTestProduct, wastePct, finalPrice, commissionPct]);
```

Agregar al return, después de `handleEstimateEdit,`:

```ts
    isTestProduct,
    units,
    unitGramsFinalProduct,
    dummyRows,
    cifOverride,
    effectiveCif,
    isDummyEstimating,
    dummyEstimateError,
    handleAddRow,
    handleRemoveRow,
    handleRowChange,
    handleUnitsChange,
    handleGramsChange,
    handleCifOverrideChange,
    handleCifOverrideReset,
    handleRegisterDummyPrice
```

- [ ] **Step 9: Verificar tipos y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores. Si `useCallback` o `useEffect` no están importados, agregarlos al import de react de la línea 5.

- [ ] **Step 10: Commit**

```bash
git add src/hooks/costs/useEstimate.ts
git commit -m "feat(costs): estado del modo dummy en useEstimate"
```

---

### Task 7: Inputs de unidades y gramos en `EstimateForm`

**Files:**
- Modify: `src/views/pages/finanzas-y-administracion/costos/estimate/EstimateForm.tsx`
- Modify: `src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx`

**Interfaces:**
- Consumes: `isTestProduct`, `units`, `unitGramsFinalProduct`, `handleUnitsChange`, `handleGramsChange` de Task 6; `isDummyEstimating` de Task 6.
- Produces: props nuevas `isTestProduct`, `units`, `unitGramsFinalProduct`, `isEstimatingDummy`, `onUnitsChange`, `onGramsChange`.

- [ ] **Step 1: Agregar las props a la interface**

Reemplazar la interface `Props` por:

```ts
interface Props {
  productList: ProductOption[];
  selectedProduct: ProductOption | null;
  quantityKg?: number;
  error: string | null;
  isEstimating?: boolean;
  isTestProduct?: boolean;
  units?: number | string;
  unitGramsFinalProduct?: number | string;
  isEstimatingDummy?: boolean;
  onProductChange: (product: ProductOption | null) => void;
  onQuantityChange?: (quantity: number) => void;
  onUnitsChange?: (value: number | string) => void;
  onGramsChange?: (value: number | string) => void;
  onEstimate?: () => void;
}
```

- [ ] **Step 2: Renderizar los inputs solo en modo dummy**

Reemplazar la destructuración de la línea 22:

```ts
const EstimateForm = ({
  productList,
  selectedProduct,
  error,
  onProductChange,
  isTestProduct,
  units,
  unitGramsFinalProduct,
  isEstimatingDummy,
  onUnitsChange,
  onGramsChange
}: Props) => {
```

Y dentro del `<Grid container>`, después del `<Grid>` del producto, agregar:

```tsx
        {isTestProduct && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField
                label='Unidades'
                type='number'
                value={units ?? ""}
                onChange={e => onUnitsChange?.(e.target.value === "" ? "" : Number(e.target.value))}
                inputProps={{ min: 1, step: 1 }}
                helperText='Cantidad de unidades de la presentación'
                disabled={isEstimatingDummy}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField
                label='Gramos por unidad'
                type='number'
                value={unitGramsFinalProduct ?? ""}
                onChange={e => onGramsChange?.(e.target.value === "" ? "" : Number(e.target.value))}
                inputProps={{ min: 1, step: 1 }}
                helperText='Mínimo efectivo: 100 g'
                disabled={isEstimatingDummy}
                fullWidth
              />
            </Grid>
          </>
        )}
```

- [ ] **Step 3: Pasar las props desde `index.tsx`**

En `src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx`, agregar al destructuring de `useEstimate()`:

```ts
    isTestProduct,
    units,
    unitGramsFinalProduct,
    isDummyEstimating,
    handleUnitsChange,
    handleGramsChange,
```

Y al `<EstimateForm>`, agregar:

```tsx
            isTestProduct={isTestProduct}
            units={units}
            unitGramsFinalProduct={unitGramsFinalProduct}
            isEstimatingDummy={isDummyEstimating}
            onUnitsChange={handleUnitsChange}
            onGramsChange={handleGramsChange}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && pnpm dev`
Expected: al seleccionar el dummy aparecen los dos inputs; no aparecen para productos reales.

- [ ] **Step 5: Commit**

```bash
git add src/views/pages/finanzas-y-administracion/costos/estimate/EstimateForm.tsx src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx
git commit -m "feat(costs): inputs de unidades y gramos para el modo dummy"
```

---

### Task 8: Componente `MaterialRow` y tabla con filas agregables

**Files:**
- Create: `src/views/pages/finanzas-y-administracion/costos/estimate/MaterialRow.tsx`
- Modify: `src/views/pages/finanzas-y-administracion/costos/estimate/CostBreakdown.tsx`

**Interfaces:**
- Consumes: `IDummySimulationRow`, `IMaterialPriceOption` (Task 1); handlers de Task 6.
- Produces: componente `MaterialRow` con props `{ row, options, onChange, onRemove }`.

- [ ] **Step 1: Crear `MaterialRow.tsx`**

```tsx
"use client";

import type { FC } from "react";

import { MenuItem, Stack, TableCell, TableRow, TextField } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomIconButton from "@/@core/components/mui/IconButton";
import type { IDummySimulationRow, IMaterialPriceOption } from "@/types/pages/costs";

interface MaterialRowProps {
  row: IDummySimulationRow;
  options: IMaterialPriceOption[];
  isPending: boolean;
  onChange: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemove: (localId: string) => void;
}

const MaterialRow: FC<MaterialRowProps> = ({ row, options, isPending, onChange, onRemove }) => {
  const priceLabel = row.materialType === "feedstock" ? "Precio x (g)" : "Precio x (unidad)";
  const qtyLabel = row.materialType === "feedstock" ? "Cantidad base (g)" : "Unidades base";

  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 500 }}>{row.materialName}</TableCell>
      <TableCell>
        <TextField
          size='small'
          type='number'
          value={row.unitCost}
          onChange={e => onChange(row.localId, "unitCost", e.target.value === "" ? "" : Number(e.target.value))}
          inputProps={{ min: 0, step: "any" }}
          disabled={isPending}
          placeholder='0.00'
          sx={{ minWidth: 110 }}
        />
        <Typography variant='caption' color='text.secondary' display='block'>
          {priceLabel}
        </Typography>
      </TableCell>
      <TableCell>
        <TextField
          size='small'
          type='number'
          value={row.quantity}
          onChange={e => onChange(row.localId, "quantity", e.target.value === "" ? "" : Number(e.target.value))}
          inputProps={{ min: 0, step: "any" }}
          disabled={isPending}
          placeholder='0.00'
          sx={{ minWidth: 110 }}
        />
        <Typography variant='caption' color='text.secondary' display='block'>
          {qtyLabel}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <CustomIconButton size='small' color='error' disabled={isPending} onClick={() => onRemove(row.localId)}>
          <Icon icon='mdi:trash-can-outline' fontSize={18} />
        </CustomIconButton>
      </TableCell>
    </TableRow>
  );
};

export default MaterialRow;
```

Falta el import de `Typography` — agregarlo:

```tsx
import { MenuItem, Stack, TableCell, TableRow, TextField, Typography } from "@mui/material";
```

`MenuItem` y `Stack` no se usan en este componente; quitarlos del import para no romper `no-unused-vars`.

- [ ] **Step 2: Quitar el `useEffect` de `CostBreakdown.tsx`**

**Nota sobre el `useEffect` en `CostBreakdown`:** mantenerlo para el camino normal (producto real). No se elimina globalmente, sino que no se usa en modo dummy; el bloque pasa a condicionarse para no ejecutar cuando `isTestProduct` es `true`. Ver Global Constraints.

- [ ] **Step 2: Ajustar el `useEffect` de `CostBreakdown.tsx`**

Modificar el bloque (líneas 118-129) para que no se ejecute en modo dummy:

```tsx
useEffect(() => {
  if (isTestProduct) return;
  if (onEstimateEdit && estimate) {
    const realTotalCostFeedstock = type === "feedstock" ? totalRealUnitCost : estimate.realTotalCostFeedstock;
    const realTotalCostPackaging = type === "packaging" ? totalRealUnitCost : estimate.realTotalCostPackaging;

    onEstimateEdit({
      realTotalCostFeedstock,
      realTotalCostPackaging,
      realCostMaterialUnit: realTotalCostFeedstock + realTotalCostPackaging
    });
  }
}, [totalRealUnitCost, type, isTestProduct, onEstimateEdit, estimate]);
```

El `/* eslint-disable react-hooks/exhaustive-deps */` puede mantenerse o eliminarse según el repo, pero agregar las deps corregidas es preferible.

- [ ] **Step 3: Renderizar las tablas también cuando están vacías en modo dummy**

Reemplazar el filtro y el condicional de `feedstockMaterials` (líneas 20-52) por:

```tsx
  const feedstockRows = dummyRows.filter(r => r.materialType === "feedstock");
  const packagingRows = dummyRows.filter(r => r.materialType === "packaging");
  const showFeedstock = isTestProduct || materialWithIndex.some(m => m.material.materialType === "feedstock");
  const showPackaging = isTestProduct || materialWithIndex.some(m => m.material.materialType === "packaging");

  return (
    <Grid container spacing={4}>
      {showFeedstock && (
        <Grid item xs={12}>
          <CustomCard title='Materia Prima'>
            {isTestProduct ? (
              <DummyMaterialTable
                rows={feedstockRows}
                options={feedstockPrices}
                isPending={isDummyEstimating}
                onChange={onRowChange}
                onRemove={onRemoveRow}
                onAdd={option => onAddRow("feedstock", option)}
              />
            ) : (
              <MaterialTable
                materials={materialWithIndex.filter(m => m.material.materialType === "feedstock")}
                estimate={estimate}
                type='feedstock'
                onMaterialChange={onMaterialChange}
              />
            )}
          </CustomCard>
        </Grid>
      )}

      {showPackaging && (
        <Grid item xs={12}>
          <CustomCard title='Material de Empaque'>
            {isTestProduct ? (
              <DummyMaterialTable
                rows={packagingRows}
                options={packagingPrices}
                isPending={isDummyEstimating}
                onChange={onRowChange}
                onRemove={onRemoveRow}
                onAdd={option => onAddRow("packaging", option)}
              />
            ) : (
              <MaterialTable
                materials={materialWithIndex.filter(m => m.material.materialType === "packaging")}
                estimate={estimate}
                type='packaging'
                onMaterialChange={onMaterialChange}
              />
            )}
          </CustomCard>
        </Grid>
      )}
```

- [ ] **Step 4: Agregar `DummyMaterialTable` y el botón de agregar**

Agregar en `CostBreakdown.tsx`:

```tsx
type DummyMaterialTableProps = {
  rows: IDummySimulationRow[];
  options: IMaterialPriceOption[];
  isPending: boolean;
  onChange: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemove: (localId: string) => void;
  onAdd: (option: IMaterialPriceOption) => void;
};

const DummyMaterialTable = ({ rows, options, isPending, onChange, onRemove, onAdd }: DummyMaterialTableProps) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Material</TableCell>
        <TableCell width={150} align='right'>
          Precio
        </TableCell>
        <TableCell width={150} align='right'>
          Cantidad
        </TableCell>
        <TableCell width={60} />
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map(row => (
        <MaterialRow key={row.localId} row={row} options={options} isPending={isPending} onChange={onChange} onRemove={onRemove} />
      ))}
      <TableRow>
        <TableCell colSpan={4}>
          <Select materialOptions={options} onSelect={onAdd} disabled={isPending || options.length === 0} />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
```

Y el `Select`, que replica el patrón de `CifItemRow`:

```tsx
const Select = ({
  materialOptions,
  onSelect,
  disabled
}: {
  materialOptions: IMaterialPriceOption[];
  onSelect: (option: IMaterialPriceOption) => void;
  disabled: boolean;
}) => (
  <CustomButton
    variant='text'
    size='small'
    color='primary'
    disabled={disabled}
    startIcon={<Icon icon='mdi:plus' />}
    onClick={() => {
      const next = materialOptions[0];

      if (next) onSelect(next);
    }}
  >
    Agregar material
  </CustomButton>
);
```
  materialOptions,
  onSelect,
  disabled
}: {
  materialOptions: IMaterialPriceOption[];
  onSelect: (option: IMaterialPriceOption) => void;
  disabled: boolean;
}) => {
  const [value, setValue] = useState("");

  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      <TextField
        select
        size='small'
        value={value}
        onChange={e => {
          const picked = materialOptions.find(o => o.id === e.target.value);

          if (picked) {
            onSelect(picked);
            setValue("");
          }
        }}
        disabled={disabled || materialOptions.length === 0}
        sx={{ minWidth: 260 }}
      >
        <MenuItem value='' disabled>
          Seleccione un material
        </MenuItem>
        {materialOptions.map(o => (
          <MenuItem key={o.id} value={o.id}>
            {o.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};
```

- [ ] **Step 6: Agregar los imports y las props de `CostBreakdown`**

Imports nuevos al inicio de `CostBreakdown.tsx`:

```tsx
import { useState } from "react";

import { Grid, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomButton from "@/@core/components/mui/Button";
import MaterialRow from "./MaterialRow";
import type { IDummySimulationRow, IMaterialPriceOption } from "@/types/pages/costs";
```

Reemplazar la interface `Props` por:

```tsx
interface Props {
  estimate: ICostEstimate;
  isTestProduct?: boolean;
  dummyRows?: IDummySimulationRow[];
  feedstockPrices?: IMaterialPriceOption[];
  packagingPrices?: IMaterialPriceOption[];
  isDummyEstimating?: boolean;
  onMaterialChange?: (index: number, value: string) => void;
  onRowChange?: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemoveRow?: (localId: string) => void;
  onAddRow?: (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) => void;
}
```

Y actualizar la destructuración de `CostBreakdown`:

```tsx
const CostBreakdown = ({
  estimate,
  isTestProduct = false,
  dummyRows = [],
  feedstockPrices = [],
  packagingPrices = [],
  isDummyEstimating = false,
  onMaterialChange,
  onRowChange,
  onRemoveRow,
  onAddRow
}: Props) => {
```

- [ ] **Step 7: Pasar las props desde `EstimateResultCard`**

En `src/views/pages/finanzas-y-administracion/costos/estimate/EstimateResultCard.tsx`, extender `Props` con las mismas props nuevas y pasarlas al `<CostBreakdown>`:

```tsx
            <CostBreakdown
              estimate={estimate}
              isTestProduct={isTestProduct}
              dummyRows={dummyRows}
              feedstockPrices={feedstockPrices}
              packagingPrices={packagingPrices}
              isDummyEstimating={isDummyEstimating}
              onMaterialChange={readOnly ? undefined : onMaterialChange}
              onRowChange={readOnly ? undefined : onRowChange}
              onRemoveRow={readOnly ? undefined : onRemoveRow}
              onAddRow={readOnly ? undefined : onAddRow}
            />
```

Y en `index.tsx`, agregar al `<EstimateResultCard>`:

```tsx
            isTestProduct={isTestProduct}
            dummyRows={dummyRows}
            feedstockPrices={feedstockPrices}
            packagingPrices={packagingPrices}
            isDummyEstimating={isDummyEstimating}
            onRowChange={handleRowChange}
            onRemoveRow={handleRemoveRow}
            onAddRow={handleAddRow}
```

con `useMaterialPrices()` agregado al componente:

```tsx
  const { feedstockPrices, packagingPrices } = useMaterialPrices();
```

- [ ] **Step 8: Verificar**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores. En el dummy, las tablas se ven vacías con select para agregar.

- [ ] **Step 9: Commit**

```bash
git add src/views/pages/finanzas-y-administracion/costos/estimate/MaterialRow.tsx src/views/pages/finanzas-y-administracion/costos/estimate/CostBreakdown.tsx src/views/pages/finanzas-y-administracion/costos/estimate/EstimateResultCard.tsx src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx
git commit -m "feat(costs): filas de material agregables en modo dummy"
```

---

### Task 9: CIF editable y piso de 100g en el summary

**Files:**
- Modify: `src/views/pages/finanzas-y-administracion/costos/estimate/CostSummaryCards.tsx`

**Interfaces:**
- Consumes: `cifOverride`, `handleCifOverrideChange`, `handleCifOverrideReset` de Task 6; `ICostEstimate.unitGramsFinalProductUsed` de Task 1.
- Produces: props `cifOverride`, `onCifOverrideChange`, `onCifOverrideReset`, `readOnly`.

- [ ] **Step 1: Agregar el bloque de CIF editable**

En `CostSummaryCards.tsx`, después de los tres `Grid` existentes (antes del cierre del fragment), agregar:

```tsx
      <Grid item xs={12}>
        <CustomCard title='Costo Indirecto de Fabricación (CIF)'>
          {!readOnly ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <TextField
                size='small'
                type='number'
                label='Total CIF'
                value={cifOverride ?? estimate.totalCif}
                onChange={e => {
                  const v = e.target.value === "" ? null : Number(e.target.value);

                  onCifOverrideChange?.(v !== null && Number.isFinite(v) ? v : null);
                }}
                inputProps={{ min: 0, step: 'any' }}
                sx={{ width: 200 }}
                helperText='Solo afecta esta vista; no se guarda'
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<Icon icon='mdi:restore' />}
                disabled={cifOverride === null}
                onClick={() => onCifOverrideReset?.()}
              >
                Restaurar valor del backend
              </Button>
            </Stack>
          ) : (
            <Typography>{formatCurrency(estimate.totalCif)}</Typography>
          )}
        </CustomCard>
      </Grid>
      {hasGramsFloor && (
        <Grid item xs={12}>
          <Alert severity='info'>
            El cálculo usa {estimate.unitGramsFinalProductUsed} g como mínimo. El valor solicitado fue{' '}
            {estimate.unitGramsFinalProduct} g y se conserva así en el snapshot.
          </Alert>
        </Grid>
      )}
```

- [ ] **Step 2: Agregar los imports y la prop `readOnly`**

Imports:

```tsx
import { Alert, Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";

import { Icon } from "@iconify/react";
```

Reemplazar `interface Props`:

```tsx
interface Props {
  estimate: ICostEstimate;
  cifOverride?: number | null;
  readOnly?: boolean;
  onCifOverrideChange?: (value: number | null) => void;
  onCifOverrideReset?: () => void;
}
```

Y la destructuración:

```tsx
const CostSummaryCards = ({ estimate, cifOverride = null, readOnly = false, onCifOverrideChange, onCifOverrideReset }: Props) => {
  const materialCost = estimate.realTotalCostFeedstock + estimate.realTotalCostPackaging;
  const hasGramsFloor =
    estimate.unitGramsFinalProductUsed !== null &&
    estimate.unitGramsFinalProduct !== null &&
    estimate.unitGramsFinalProductUsed > estimate.unitGramsFinalProduct;
```

- [ ] **Step 3: Pasar las props desde `EstimateResultCard` y `SnapshotDetailDialog`**

En `EstimateResultCard.tsx`, agregar las props al `<CostSummaryCards>`:

```tsx
          <CostSummaryCards
            estimate={estimate}
            cifOverride={cifOverride}
            readOnly={readOnly}
            onCifOverrideChange={readOnly ? undefined : onCifOverrideChange}
            onCifOverrideReset={readOnly ? undefined : onCifOverrideReset}
          />
```

En `SnapshotDetailDialog.tsx`, reemplazar `<CostSummaryCards estimate={estimate} />` por `<CostSummaryCards estimate={estimate} readOnly />` — el detalle de un snapshot guardado nunca es editable.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores. Con 50g tipeados, aparece el `Alert` de piso; editar el CIF recalcula los cards sin request.

- [ ] **Step 5: Commit**

```bash
git add src/views/pages/finanzas-y-administracion/costos/estimate/CostSummaryCards.tsx src/views/pages/finanzas-y-administracion/costos/estimate/EstimateResultCard.tsx src/views/pages/finanzas-y-administracion/costos/estimate/SnapshotDetailDialog.tsx
git commit -m "feat(costs): CIF editable y aviso del piso de 100g"
```

---

### Task 10: Ocultar precio actual y listado agregado en modo dummy

**Files:**
- Modify: `src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx`

**Interfaces:**
- Consumes: `isTestProduct` de Task 6.
- Produces: render condicional de `CurrentPriceCard` y del listado agregado.

- [ ] **Step 1: Condicionar `CurrentPriceCard`**

En `index.tsx`, reemplazar:

```tsx
        {selectedProduct && (
          <Grid item xs={12}>
            <CurrentPriceCard productId={selectedProduct.id} />
          </Grid>
        )}
```

por:

```tsx
        {selectedProduct && !isTestProduct && (
          <Grid item xs={12}>
            <CurrentPriceCard productId={selectedProduct.id} />
          </Grid>
        )}
```

- [ ] **Step 2: Agregar el Alert informativo del modo dummy**

Después de `<EstimateForm>`, agregar:

```tsx
        {isTestProduct && (
          <Grid item xs={12}>
            <Alert severity='info'>
              Estás en modo simulación: elegí libremente los materiales y la presentación. El cálculo lo resuelve el
              servidor en cada cambio.
            </Alert>
          </Grid>
        )}
```

- [ ] **Step 3: Verificar la suite completa**

Run: `pnpm test:run`
Expected: PASS — todos los tests, incluidos los nuevos de `costs`, `useGetProductList` y `useDebouncedEstimate`.

- [ ] **Step 4: Verificar lint, tipos y build**

Run: `npx tsc --noEmit && pnpm lint && pnpm build`
Expected: sin errores.

- [ ] **Step 5: Recorrer el QA manual**

Seguir [`QA.md`](./QA.md). Los casos marcados 🔵 requieren el backend de la spec upstream desplegado. Los casos sin 🔵 — sobre todo **1.2 (paridad de números del producto normal)** — deben pasar sin backend nuevo.

- [ ] **Step 6: Commit**

```bash
git add src/views/pages/finanzas-y-administracion/costos/estimate/index.tsx
git commit -m "feat(costs): ocultar precio actual e historial de precios en modo dummy"
```

---

## Self-review

**Cobertura de la spec:** decisiones 1–10 cubiertas (T6 modo y bifurcación, T7 inputs, T8 filas, T9 CIF y piso, T10 ocultar). B1–B5 mapeados en T1–T2. Puntos abiertos 2 (debounce) resuelto con default en T5; 3, 5, 6 quedan para producto y están anotados en la spec.

**Placeholder scan:** sin TBD ni "implementar después". Cada step tiene código concreto o comando exacto.

**Type consistency:** `IDummySimulationRow`, `IMaterialPriceOption`, `DummyEstimatePayload`, `DummyMaterialsPayload` se definen en T1 y se consumen con esos nombres en T3, T5, T6, T8. `effectiveCif` se produce en T6 y se usa en T9. `idMaterial: string` consistente en T1, T3, T6. `applyCifOverride` no muta el input. `apiFetch` no aparece en cliente (lecturas con `API()` de axios). `costConfig` es opcional en `createEmptySimulation` y el `useEffect` de `CostBreakdown` se preserva para el camino normal.

**Riesgos asumidos:** ninguno relevante tras las correcciones; se corrigieron el shape de `IProductPrice`, la importación server-only y la colisión con el `RegisterPricePayload` del producto normal.