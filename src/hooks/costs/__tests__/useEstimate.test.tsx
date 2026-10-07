import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ICostEstimate } from "@/types/pages/costs";
import { createEmptySimulation } from "@/utils/costs";

vi.mock("@/api/product", () => ({
  getProducts: vi.fn().mockResolvedValue([])
}));

vi.mock("@/api/instances", () => ({
  API: () => ({
    get: vi.fn().mockResolvedValue({ data: { cifAveragingMonths: 3, defaultWastePct: 0, defaultMarginPct: 40 } })
  })
}));

vi.mock("@/api/costs/actions", () => ({
  getCostEstimateAction: vi.fn(),
  registerProductPrice: vi.fn(),
  updateSnapshotAction: vi.fn(),
  saveDummyProductAction: vi.fn(),
  updateDummySnapshotAction: vi.fn()
}));

import { saveDummyProductAction } from "@/api/costs/actions";

import useEstimate from "@/hooks/costs/useEstimate";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const serverEstimate: ICostEstimate = {
  ...createEmptySimulation({ id: "P-1" }),
  realTotalCostFeedstock: 1000,
  realTotalCostPackaging: 500,
  realCostMaterialUnit: 1500,
  totalCif: 200,
  totalCost: 1700
};

describe("useEstimate - Total CIF manual", () => {
  it("suma el Total CIF manual al costo de producción", () => {
    const { result } = renderHook(() => useEstimate(), { wrapper });

    act(() => {
      result.current.loadEstimate(serverEstimate);
    });

    expect(result.current.estimate?.totalCif).toBe(200);
    expect(result.current.estimate?.totalCost).toBe(1700);

    act(() => {
      result.current.handleCifOverrideChange(999);
    });

    expect(result.current.estimate?.totalCif).toBe(999);
    expect(result.current.estimate?.totalCost).toBe(2499);
  });

  it("restaura el CIF calculado al limpiar el override", () => {
    const { result } = renderHook(() => useEstimate(), { wrapper });

    act(() => {
      result.current.loadEstimate(serverEstimate);
    });

    act(() => {
      result.current.handleCifOverrideChange(999);
    });

    expect(result.current.estimate?.totalCif).toBe(999);

    act(() => {
      result.current.handleCifOverrideReset();
    });

    expect(result.current.estimate?.totalCif).toBe(200);
    expect(result.current.estimate?.totalCost).toBe(1700);
  });
});

describe("useEstimate - handleRegisterDummyPrice", () => {
  const feedstockOption = { id: "F-1", name: "Glicina", pricePerGram: 0.5, pricePerUnit: null };

  const setupCompleteRow = (hook: { current: ReturnType<typeof useEstimate> }) => {
    act(() => {
      hook.current.handleAddRow("feedstock", feedstockOption);
    });

    const localId = hook.current.dummyRows[0].localId;

    act(() => {
      hook.current.handleRowChange(localId, "quantity", 100);
      hook.current.methods.setValue("finalPrice", 15000);
    });
  };

  it("guarda aunque el materials del form esté vacío", async () => {
    vi.mocked(saveDummyProductAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useEstimate(), { wrapper });

    setupCompleteRow(result);

    expect(result.current.methods.getValues("materials")).toEqual([]);

    await act(async () => {
      await result.current.handleRegisterDummyPrice();
    });

    await waitFor(() => expect(saveDummyProductAction).toHaveBeenCalledTimes(1));

    const payload = vi.mocked(saveDummyProductAction).mock.calls[0][0];

    expect(payload.materials).toEqual([
      { idMaterial: "F-1", materialType: "feedstock", materialName: "Glicina", quantity: 100, unitCost: 0.5 }
    ]);
    expect(payload.finalPrice).toBe(15000);
  });

  it("no guarda con gramos inválidos", async () => {
    vi.mocked(saveDummyProductAction).mockClear();

    const { result } = renderHook(() => useEstimate(), { wrapper });

    setupCompleteRow(result);

    act(() => {
      result.current.handleGramsChange("");
    });

    await act(async () => {
      await result.current.handleRegisterDummyPrice();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(saveDummyProductAction).not.toHaveBeenCalled();
  });
});

describe("useEstimate - comisión en el margen", () => {
  const estimateWithWaste: ICostEstimate = {
    ...serverEstimate,
    totalCostWaste: 2000
  };

  it("resta la comisión del margen de ganancia y baja la utilidad", () => {
    const { result } = renderHook(() => useEstimate(), { wrapper });

    act(() => {
      result.current.loadEstimate(estimateWithWaste);
    });

    act(() => {
      result.current.methods.setValue("finalPrice", 3000);
      result.current.methods.setValue("comissionPct", 10);
    });

    expect(result.current.estimate?.price.commissionValue).toBe(300);
    expect(result.current.estimate?.costDifference).toBe(700);
    expect(result.current.estimate?.utilityPct).toBeCloseTo(23.33, 1);
  });

  it("sin comisión el margen no cambia", () => {
    const { result } = renderHook(() => useEstimate(), { wrapper });

    act(() => {
      result.current.loadEstimate(estimateWithWaste);
    });

    act(() => {
      result.current.methods.setValue("finalPrice", 3000);
    });

    expect(result.current.estimate?.costDifference).toBe(1000);
    expect(result.current.estimate?.utilityPct).toBeCloseTo(33.33, 1);
  });
});
