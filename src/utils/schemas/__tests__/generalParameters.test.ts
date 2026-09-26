import { describe, it, expect } from "vitest";

import { categorySchema } from "@/utils/schemas/generalParameters";
import { CategoryType } from "@/utils/enum";

const base = {
  type: { id: CategoryType.FINISHED_PRODUCT, label: "Producto terminado" }
};

describe("categorySchema", () => {
  it("producto requiere idIndicator de 2 digitos y expirationMonths", async () => {
    await expect(categorySchema.validate({ name: "A", ...base, idIndicator: "2A" })).rejects.toThrow(
      "El indicativo de id debe tener exactamente 2 dígitos"
    );
  });

  it("producto valida correctamente", async () => {
    await expect(
      categorySchema.validate({ name: "A", ...base, idIndicator: "20", expirationMonths: 4 })
    ).resolves.toBeTruthy();
  });

  it("empaque requiere codeIndicator", async () => {
    const pkg = { type: { id: CategoryType.PACKAGING, label: "Material de empaque" } };

    await expect(categorySchema.validate({ name: "A", ...pkg })).rejects.toThrow(
      "El indicativo de código es requerido"
    );
  });

  it("lote requiere lotFormat", async () => {
    const lot = { type: { id: CategoryType.LOT, label: "Categoría de lote" } };

    await expect(categorySchema.validate({ name: "A", ...lot })).rejects.toThrow("El formato de lote es requerido");
  });
});
