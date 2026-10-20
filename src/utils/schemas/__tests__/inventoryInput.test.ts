import { describe, it, expect } from "vitest";

import {
  kardexFeedstockInputSchema,
  kardexPackagingInputSchema,
  kardexProductInputSchema
} from "@/utils/schemas/inventory/input";

const feedstockBase = {
  material: { id: "MP-1", name: "Vact" },
  provider: { id: "1", name: "Proveedor" },
  unit: { value: "kg", label: "Kilogramos" },
  batch: "LOTE-1",
  expirationDate1: new Date("2027-01-01")
};

const packagingBase = {
  material: { id: "ME-1", name: "Frasco" },
  provider: { id: "1", name: "Proveedor" },
  batch: "LOTE-1"
};

const productBase = {
  product: { id: "PT-1", name: "Producto" },
  order: 1,
  batch: "LOTE-1",
  rack: { id: "R-1" },
  expirationDate1: new Date("2027-01-01")
};

describe("kardexFeedstockInputSchema", () => {
  it.each(["-1", "0", -1, 0])("rechaza cantidad %s", async quantity => {
    await expect(kardexFeedstockInputSchema.validate({ ...feedstockBase, quantity, charge: "1000" })).rejects.toThrow(
      "La cantidad debe ser mayor a 0"
    );
  });

  it.each(["0", "-500"])("rechaza valor %s", async charge => {
    await expect(kardexFeedstockInputSchema.validate({ ...feedstockBase, quantity: "1", charge })).rejects.toThrow(
      "El valor debe ser mayor a 0"
    );
  });

  it("rechaza texto no numérico", async () => {
    await expect(
      kardexFeedstockInputSchema.validate({ ...feedstockBase, quantity: "abc", charge: "1000" })
    ).rejects.toThrow("La cantidad debe ser un número");
  });

  it("acepta cantidad decimal y valor positivos", async () => {
    const values = await kardexFeedstockInputSchema.validate({ ...feedstockBase, quantity: "1.5", charge: "3000" });

    expect(values.quantity).toBe(1.5);
    expect(values.charge).toBe(3000);
  });
});

describe("kardexPackagingInputSchema", () => {
  it("rechaza cantidad negativa", async () => {
    await expect(
      kardexPackagingInputSchema.validate({ ...packagingBase, quantity: "-1", charge: "100" })
    ).rejects.toThrow("La cantidad debe ser mayor a 0");
  });

  it("rechaza cantidad decimal", async () => {
    await expect(
      kardexPackagingInputSchema.validate({ ...packagingBase, quantity: "1.5", charge: "100" })
    ).rejects.toThrow("La cantidad debe ser un número entero");
  });

  it("rechaza valor 0", async () => {
    await expect(
      kardexPackagingInputSchema.validate({ ...packagingBase, quantity: "10", charge: "0" })
    ).rejects.toThrow("El valor debe ser mayor a 0");
  });

  it("acepta valores positivos", async () => {
    await expect(
      kardexPackagingInputSchema.validate({ ...packagingBase, quantity: "10", charge: "100" })
    ).resolves.toBeTruthy();
  });
});

describe("kardexProductInputSchema", () => {
  it.each(["-1", "0"])("rechaza cantidad %s", async quantity => {
    await expect(kardexProductInputSchema.validate({ ...productBase, quantity })).rejects.toThrow(
      "La cantidad debe ser mayor a 0"
    );
  });

  it("acepta cantidad entera positiva", async () => {
    await expect(kardexProductInputSchema.validate({ ...productBase, quantity: "5" })).resolves.toBeTruthy();
  });
});
