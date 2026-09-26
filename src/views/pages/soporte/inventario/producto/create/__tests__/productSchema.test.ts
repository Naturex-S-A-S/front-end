import { describe, it, expect } from "vitest";

import { productSchema, updateProductSchema } from "@/utils/schemas/inventory/product";

describe("productSchema", () => {
  it("requiere categoria y lotCategory como objetos unicos", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: { id: "c1", name: "Cat" },
        lotCategory: { id: "l1", name: "Alimentos" }
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza sin lotCategory", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: { id: "c1", name: "Cat" },
        lotCategory: null
      })
    ).rejects.toThrow("La categoría de lote es requerida");
  });

  it("rechaza sin categoria", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: null,
        lotCategory: { id: "l1", name: "Alimentos" }
      })
    ).rejects.toThrow("La categoría es requerida");
  });
});

describe("updateProductSchema", () => {
  const base = {
    name: "A",
    measurement: 100,
    unit: { id: "g", name: "g" },
    minimumStandard: 1
  };

  it("acepta la categoria de lote", async () => {
    await expect(
      updateProductSchema.validate({ ...base, lotCategory: { id: "l1", name: "Alimentos" } })
    ).resolves.toBeTruthy();
  });

  it("rechaza sin categoria de lote", async () => {
    await expect(updateProductSchema.validate({ ...base, lotCategory: null })).rejects.toThrow(
      "La categoría de lote es requerida"
    );
  });

  it("no exige la categoria del producto", async () => {
    await expect(
      updateProductSchema.validate({ ...base, lotCategory: { id: "l1", name: "Alimentos" } })
    ).resolves.toBeTruthy();
  });
});
