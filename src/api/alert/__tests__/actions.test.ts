import { revalidateTag } from "next/cache";

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiFetch = vi.fn();

vi.mock("@/api/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args)
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn()
}));

import { markAllAlertsAsRead } from "../actions";

describe("markAllAlertsAsRead", () => {
  beforeEach(() => {
    mockApiFetch.mockResolvedValue(undefined);
  });

  it("marca cada id como leido via PUT alerts/{id}/status", async () => {
    const result = await markAllAlertsAsRead([1, 2]);

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "alerts/1/status",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ readed: true }) })
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "alerts/2/status",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ readed: true }) })
    );
    expect(result).toEqual({ success: true });
  });

  it("revalida el tag alerts una sola vez al terminar", async () => {
    await markAllAlertsAsRead([1, 2, 3]);

    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith("alerts");
  });

  it("con lista vacia no llama al backend pero devuelve success", async () => {
    const result = await markAllAlertsAsRead([]);

    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("devuelve success false si alguna llamada falla", async () => {
    mockApiFetch.mockRejectedValue(new Error("boom"));

    const result = await markAllAlertsAsRead([1]);

    expect(result.success).toBe(false);
  });
});
