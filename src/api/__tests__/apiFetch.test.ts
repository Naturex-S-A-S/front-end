import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const getServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => getServerSession(...args)
}));

vi.mock("@/lib/nextAuthOptions", () => ({
  authOptions: {}
}));

import { apiFetch } from "@/api/apiFetch";

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 400 ? "Bad Request" : "OK",
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    headers: { get: () => null }
  }) as any;

describe("apiFetch - mensajes de error", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    getServerSession.mockResolvedValue({ access_token: "token" });
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test/";
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("muestra el message string del backend tal cual", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(400, { message: "Cantidad inválida" })));

    await expect(apiFetch("costs/dummy-product/estimate", { method: "POST" })).rejects.toThrow(
      "Cantidad inválida"
    );
  });

  it("serializa un message objeto en vez de devolver [object Object]", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { message: { "materials[0].quantity": "no debe ser nulo" } }))
    );

    const assertion = apiFetch("costs/dummy-product/estimate", { method: "POST" });

    await expect(assertion).rejects.toThrow("materials[0].quantity");

    await assertion.catch((e: Error) => {
      expect(e.message).not.toContain("[object Object]");
    });
  });
});
