import { describe, expect, it } from "vitest";

import { columns } from "@/utils/columns/movements";

const fields = (type: "packaging" | "feedStock") =>
  columns({ filters: { measureUnit: { value: "g", label: "Gramo" } }, type: type as any }).map(c => c.field);

describe("columnas de los listados de movimientos", () => {
  it.each(["packaging", "feedStock"] as const)("%s: Código primero y las órdenes después de Clasificación", type => {
    const list = fields(type);
    const classification = list.indexOf("classification");

    expect(list[0]).toBe("materialId");
    expect(list[classification + 1]).toBe("supplyOrderId");
    expect(list[classification + 2]).toBe("orderId");
  });
});
