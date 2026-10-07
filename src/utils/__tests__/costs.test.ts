import { describe, it, expect } from "vitest";

import type { ICostEstimate, IDummySimulationRow } from "@/types/pages/costs";

import {
  createEmptySimulation,
  buildDummyMaterialsPayload,
  isDummyRowComplete,
  applyCifOverride
} from "@/utils/costs";

const config = { cifAveragingMonths: 3, defaultWastePct: 5, defaultMarginPct: 30 };

describe("createEmptySimulation", () => {
  it("devuelve un estimate con todos los montos en cero y listas vacias", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.totalCost).toBe(0);
    expect(sim.totalCif).toBe(0);
    expect(sim.realTotalCostFeedstock).toBe(0);
    expect(sim.realTotalCostPackaging).toBe(0);
    expect(sim.materials).toEqual([]);
    expect(sim.cifDetails).toEqual([]);
    expect(sim.periods).toEqual([]);
  });

  it("hereda wastePct y el margen del config en el nivel superior", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.wastePct).toBe(5);
    expect(sim.defaultMarginPct).toBe(30);
  });

  it("no deja ningun monto en undefined ni NaN", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);
    const numeric = Object.entries(sim).filter(([, v]) => typeof v === "number") as [string, number][];

    expect(numeric.length).toBeGreaterThan(10);
    numeric.forEach(([key, value]) => {
      expect(Number.isFinite(value), `${key} es ${value}`).toBe(true);
    });
    Object.entries(sim.price).forEach(([key, value]) => {
      if (value === null) return;
      if (typeof value !== "number") return;
      expect(Number.isFinite(value as number), `price.${key} es ${value}`).toBe(true);
    });
  });

  it("usa divisors distintos de cero para que el summary no muestre NaN", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.quantityKg).toBeGreaterThan(0);
    expect(sim.units).toBeGreaterThan(0);
  });

  it("funciona sin config para no depender del timing del useQuery", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true });

    expect(sim.wastePct).toBe(0);
    expect(sim.defaultMarginPct).toBe(0);
    expect(sim.price.suggestedPrice).toBe(0);
  });

  it("deja unitGramsFinalProductUsed disponible para el piso de 100g", () => {
    const sim = createEmptySimulation({ id: "TEST-1", isTestProduct: true }, config);

    expect(sim.unitGramsFinalProductUsed).toBeNull();
  });
});

describe("isDummyRowComplete", () => {
  const row = (over: Partial<IDummySimulationRow> = {}): IDummySimulationRow => ({
    localId: "f-1",
    materialType: "feedstock",
    idMaterial: "10",
    materialName: "Rosa Mosqueta",
    unitCost: 0.5,
    quantity: 100,
    isDraft: true,
    ...over
  });

  it("exige material, cantidad y costo positivo", () => {
    expect(isDummyRowComplete(row())).toBe(true);
  });

  it("falla si falta el material", () => {
    expect(isDummyRowComplete(row({ idMaterial: "" }))).toBe(false);
  });

  it("falla si falta la cantidad", () => {
    expect(isDummyRowComplete(row({ quantity: "" }))).toBe(false);
  });

  it("falla si falta el precio", () => {
    expect(isDummyRowComplete(row({ unitCost: "" }))).toBe(false);
  });

  it("falla con precio cero", () => {
    expect(isDummyRowComplete(row({ unitCost: 0 }))).toBe(false);
  });

  it("falla si falta el nombre del material", () => {
    expect(isDummyRowComplete(row({ materialName: "" }))).toBe(false);
  });

  it("acepta cantidades en string numérico", () => {
    expect(isDummyRowComplete(row({ quantity: "150", unitCost: "0.75" }))).toBe(true);
  });
});

describe("buildDummyMaterialsPayload", () => {
  it("mapea idMaterial, materialType, quantity y unitCost como numeros", () => {
    const payload = buildDummyMaterialsPayload([
      {
        localId: "f-1",
        materialType: "feedstock",
        idMaterial: "10",
        materialName: "Rosa Mosqueta",
        unitCost: "0.5",
        quantity: "100",
        isDraft: true
      }
    ]);

    expect(payload).toEqual([
      { idMaterial: "10", materialType: "feedstock", materialName: "Rosa Mosqueta", quantity: 100, unitCost: 0.5 }
    ]);
  });

  it("descarta filas incompletas", () => {
    const payload = buildDummyMaterialsPayload([
      {
        localId: "f-1",
        materialType: "feedstock",
        idMaterial: "",
        materialName: "Sin material",
        unitCost: 1,
        quantity: 10,
        isDraft: true
      }
    ]);

    expect(payload).toEqual([]);
  });

  it("no lanza con lista vacia", () => {
    expect(buildDummyMaterialsPayload([])).toEqual([]);
  });
});

describe("applyCifOverride", () => {
  const base = {
    idFinalProduct: "P-1",
    totalCost: 100,
    totalCif: 25,
    realTotalCostFeedstock: 40,
    realTotalCostPackaging: 10,
    realTotalCostTotal: 50,
    wasteValue: 5,
    wastePct: 5,
    costDifference: 0,
    utilityPct: 0,
    utilityValue: 0,
    defaultMarginPct: 30,
    defaultMarginValue: 0,
    quantityKg: 1,
    units: 1,
    unitGramsFinalProduct: null,
    unitGramsFinalProductUsed: null,
    periods: [],
    cifDetails: [],
    materials: [],
    price: { suggestedPrice: 0, idFinalProduct: "P-1" }
  } as unknown as ICostEstimate;

  it("usa el override cuando viene informado", () => {
    expect(applyCifOverride(base, 80).totalCif).toBe(80);
  });

  it("mantiene el totalCif del estimate cuando el override es null", () => {
    expect(applyCifOverride(base, null).totalCif).toBe(25);
  });

  it("no muta el estimate original", () => {
    const snapshot = { ...base };

    applyCifOverride(base, 999);
    expect(base).toEqual(snapshot);
    expect(base.totalCif).toBe(25);
  });

  it("es idempotente", () => {
    const once = applyCifOverride(base, 80);
    const twice = applyCifOverride(once, 80);

    expect(twice.totalCif).toBe(once.totalCif);
  });
});
