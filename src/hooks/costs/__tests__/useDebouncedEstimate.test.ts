import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import type { ICostEstimate } from "@/types/pages/costs";

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

const asEstimate = (totalCost: number) => ({ totalCost } as unknown as ICostEstimate);

describe("useDebouncedEstimate", () => {
  beforeEach(() => {
    estimateDummyProductAction.mockReset();
    estimateDummyProductAction.mockResolvedValue({ success: true, data: asEstimate(42) });
  });

  it("no dispara el request antes del debounce", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));

    expect(estimateDummyProductAction).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    expect(estimateDummyProductAction).toHaveBeenCalledTimes(1);
  });

  it("colapsa varias llamadas seguidas en un solo request", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => {
      result.current.runEstimate(payload);
      result.current.runEstimate(payload);
      result.current.runEstimate(payload);
    });

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    expect(estimateDummyProductAction).toHaveBeenCalledTimes(1);
  });

  it("guarda el estimate devuelto", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));

    await waitFor(() => expect(result.current.estimate).toEqual(asEstimate(42)));
  });

  it("expone el error sin romper", async () => {
    estimateDummyProductAction.mockResolvedValue({ success: false, error: "Boom" });

    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));

    await waitFor(() => expect(result.current.error).toBe("Boom"));
    expect(result.current.estimate).toBeNull();
    expect(result.current.isEstimating).toBe(false);
  });

  it("descarta respuestas de requests viejo", async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};

    estimateDummyProductAction
      .mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
      .mockImplementationOnce(() => new Promise(resolve => (resolveSecond = resolve)));

    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));

    await waitFor(() => expect(estimateDummyProductAction).toHaveBeenCalledTimes(1));

    act(() => result.current.runEstimate(payload));

    await waitFor(() => expect(estimateDummyProductAction).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolveSecond({ success: true, data: asEstimate(2) });
      resolveFirst({ success: true, data: asEstimate(1) });
    });

    await waitFor(() => expect(result.current.estimate).toEqual(asEstimate(2)));
  });

  it("reset limpia el estado y cancela el timer pendiente", async () => {
    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));
    act(() => result.current.reset());

    await new Promise(resolve => setTimeout(resolve, 600));

    expect(estimateDummyProductAction).not.toHaveBeenCalled();
    expect(result.current.estimate).toBeNull();
    expect(result.current.isEstimating).toBe(false);
  });

  it("coacciona un error objeto a texto legible en vez de [object Object]", async () => {
    estimateDummyProductAction.mockResolvedValue({
      success: false,
      error: { "materials[0].quantity": "no debe ser nulo" }
    });

    const { result } = renderHook(() => useDebouncedEstimate());

    act(() => result.current.runEstimate(payload));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(typeof result.current.error).toBe("string");
    expect(result.current.error).toContain("materials[0].quantity");
    expect(result.current.error).not.toContain("[object Object]");
  });
});