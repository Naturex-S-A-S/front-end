import { describe, expect, it } from "vitest";

import { supplyPending, supplyStatus, toGrams } from "@/utils/supplyProgress";

describe("supplyProgress", () => {
  it("el pendiente nunca es negativo", () => {
    expect(supplyPending(1000, 400)).toBe(600);
    expect(supplyPending(1000, 1050)).toBe(0);
  });

  it("el estado sigue lo que ha llegado", () => {
    expect(supplyStatus(1000, 0)).toBe("none");
    expect(supplyStatus(1000, 400)).toBe("partial");
    expect(supplyStatus(1000, 1000)).toBe("complete");
    expect(supplyStatus(1000, 1050)).toBe("complete");
  });

  it("el ruido de punto flotante cuenta como completo", () => {
    expect(supplyStatus(300, (0.1 + 0.2) * 1000)).toBe("complete");
  });

  it("convierte a gramos igual que el backend", () => {
    expect(toGrams(2, "g")).toBe(2);
    expect(toGrams(1.5, "kg")).toBe(1500);
    expect(toGrams(0.002, "t")).toBe(2000);
    expect(toGrams(7, undefined)).toBe(7);
  });
});
