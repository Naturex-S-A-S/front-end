import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiFetch = vi.fn();

vi.mock("@/api/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args)
}));

import { getAlertsServer, getAlertsPageServer } from "../server";

describe("getAlertsServer (dropdown del navbar)", () => {
  beforeEach(() => {
    mockApiFetch.mockResolvedValue([]);
  });

  it("usa el endpoint alerts sin paginar", async () => {
    await getAlertsServer();

    expect(mockApiFetch).toHaveBeenCalledWith("alerts", { tags: ["alerts"] });
  });

  it("devuelve [] si el backend falla", async () => {
    mockApiFetch.mockRejectedValue(new Error("boom"));

    expect(await getAlertsServer()).toEqual([]);
  });
});

describe("getAlertsPageServer (pagina /alertas)", () => {
  beforeEach(() => {
    mockApiFetch.mockResolvedValue([]);
  });

  it("usa el endpoint alerts (todas) por defecto", async () => {
    await getAlertsPageServer();

    expect(mockApiFetch).toHaveBeenCalledWith("alerts", { tags: ["alerts"] });
  });

  it("usa alerts?onlyActive=true cuando solo se quieren no leidas", async () => {
    await getAlertsPageServer({ onlyActive: true });

    expect(mockApiFetch).toHaveBeenCalledWith("alerts?onlyActive=true", { tags: ["alerts"] });
  });

  it("devuelve los datos del backend", async () => {
    const data = [{ id: 1, comment: "hola", readed: false }];

    mockApiFetch.mockResolvedValue(data);

    expect(await getAlertsPageServer()).toEqual(data);
  });

  it("devuelve [] si el backend falla", async () => {
    mockApiFetch.mockRejectedValue(new Error("boom"));

    expect(await getAlertsPageServer()).toEqual([]);
  });
});