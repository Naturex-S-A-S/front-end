import { describe, it, expect } from "vitest";

import { packagingMaterialSchema } from "@/utils/schemas/inventory/packagingMaterial";

describe("packagingMaterialSchema", () => {
  it("requiere categoria como objeto unico", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Envase", dependsOnProduct: false }
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza sin categoria", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: null
      })
    ).rejects.toThrow("La categoría es requerida");
  });

  it("requiere productCode cuando dependsOnProduct es true", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true }
      })
    ).rejects.toThrow("El código de producto es requerido");
  });

  it("acepta productCode como objeto cuando dependsOnProduct es true", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true },
        productCode: { id: "P-001", fullName: "Producto A" }
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza productCode sin id", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true },
        productCode: { fullName: "Producto A" }
      })
    ).rejects.toThrow("El código de producto es requerido");
  });

  it("rechaza productCode como texto plano", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true },
        productCode: "P-001"
      })
    ).rejects.toThrow();
  });
});