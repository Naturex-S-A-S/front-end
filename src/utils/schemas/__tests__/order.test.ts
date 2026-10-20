import { describe, it, expect } from "vitest";

import { orderSchema } from "@/utils/schemas/order";

describe("orderSchema", () => {
  it("no exige expirationDate1", async () => {
    await expect(
      orderSchema.validate({
        presentations: [{ id: "P-001", quantityG: 10 }]
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza cantidad vacía", async () => {
    await expect(
      orderSchema.validate({
        presentations: [{ id: "P-001", quantityG: "" }]
      })
    ).rejects.toThrow();
  });

  it("rechaza cantidad negativa", async () => {
    await expect(
      orderSchema.validate({
        presentations: [{ id: "P-001", quantityG: -1 }]
      })
    ).rejects.toThrow(/al menos 0/);
  });

  it("acepta cantidad cero", async () => {
    await expect(
      orderSchema.validate({
        presentations: [{ id: "P-001", quantityG: 0 }]
      })
    ).resolves.toBeTruthy();
  });
});
