import { describe, it, expect } from "vitest";

import { orderSupplySchema } from "@/utils/schemas/orderSupply";

describe("orderSupplySchema", () => {
  const valid = {
    presentations: [{ id: "P-001", quantityG: 10 }],
    expirationDate1: new Date("2026-12-31")
  };

  it("rechaza cantidad vacía", async () => {
    await expect(
      orderSupplySchema.validate({
        ...valid,
        presentations: [{ id: "P-001", quantityG: "" }]
      })
    ).rejects.toThrow();
  });

  it("rechaza cantidad negativa", async () => {
    await expect(
      orderSupplySchema.validate({
        ...valid,
        presentations: [{ id: "P-001", quantityG: -1 }]
      })
    ).rejects.toThrow(/al menos 0/);
  });

  it("acepta cantidad cero", async () => {
    await expect(
      orderSupplySchema.validate({
        ...valid,
        presentations: [{ id: "P-001", quantityG: 0 }]
      })
    ).resolves.toBeTruthy();
  });
});
