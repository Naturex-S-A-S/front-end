import { describe, it, expect } from "vitest";

import { rawMaterialSchema } from "@/utils/schemas/inventory/rawMaterial";

describe("rawMaterialSchema", () => {
  it("acepta categoria opcional null", async () => {
    await expect(
      rawMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        allergen: false,
        category: null
      })
    ).resolves.toBeTruthy();
  });

  it("acepta categoria unica", async () => {
    await expect(
      rawMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        allergen: false,
        category: { id: "c1", name: "Polvos" }
      })
    ).resolves.toBeTruthy();
  });
});