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
});
