import { describe, expect, it } from "vitest";

import {
  buildReportSearchParams,
  resolveReportSelection,
  switchReportFilters,
  toApiParams
} from "@/utils/reports/params";
import { REPORTS, getDefaultReportForTab } from "@/utils/reports/registry";

const NOW = new Date(2026, 8, 15);

describe("informes de ventas (R-2.2 y R-2.3)", () => {
  it("la pestaña Ventas abre el primer informe habilitado, no el top de productos", () => {
    expect(getDefaultReportForTab("ventas").key).toBe("profitability");
    expect(resolveReportSelection({ tab: "ventas" }, NOW).report.key).toBe("profitability");
  });

  it("rentabilidad aplica margen neto, más rentables y top 10 por defecto", () => {
    const { filters } = resolveReportSelection({ report: "profitability" }, NOW);

    expect(filters).toMatchObject({ marginType: "net", sort: "desc", top: 10 });
  });

  it("lee margen y orden de la URL y descarta valores inválidos", () => {
    const valid = resolveReportSelection({ report: "profitability", marginType: "gross", sort: "asc" }, NOW);
    const invalid = resolveReportSelection({ report: "profitability", marginType: "x", sort: "y" }, NOW);

    expect(valid.filters).toMatchObject({ marginType: "gross", sort: "asc" });
    expect(invalid.filters).toMatchObject({ marginType: "net", sort: "desc" });
  });

  it("envía a la API los nombres que espera el back", () => {
    const { filters } = resolveReportSelection(
      { report: "profitability", marginType: "gross", sort: "asc", top: "5", lineIds: "lc-1,none" },
      NOW
    );

    expect(toApiParams(filters)).toMatchObject({
      marginType: "gross",
      sort: "asc",
      top: 5,
      lotCategoryIds: "lc-1,none"
    });
  });

  it("el margen y el orden sobreviven el viaje URL → filtros → URL", () => {
    const selection = resolveReportSelection({ report: "profitability", marginType: "gross", sort: "asc" }, NOW);
    const params = buildReportSearchParams(selection);

    expect(params.get("marginType")).toBe("gross");
    expect(params.get("sort")).toBe("asc");
  });

  it("Pareto no hereda top, margen ni orden al cambiar desde rentabilidad", () => {
    const { filters } = resolveReportSelection(
      { report: "profitability", marginType: "gross", sort: "asc", top: "5", origin: "siigo" },
      NOW
    );

    const next = switchReportFilters(filters, REPORTS["profit-pareto"], NOW);

    expect(next.origin).toBe("siigo");
    expect(next.top).toBeUndefined();
    expect(next.marginType).toBeUndefined();
    expect(next.sort).toBeUndefined();
    expect(toApiParams(next)).not.toHaveProperty("top");
  });
});
