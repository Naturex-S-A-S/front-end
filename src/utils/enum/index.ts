export enum MaterialType {
  FEEDSTOCK = "FEEDSTOCK",
  PACKAGING = "PACKAGING"
}

export enum CategoryType {
  FEEDSTOCK = "1",
  PACKAGING = "2",
  FINISHED_PRODUCT = "3",
  LOT = "4"
}

export enum CategoryTypeName {
  FEEDSTOCK = "Materia prima",
  PACKAGING = "Material de empaque",
  FINISHED_PRODUCT = "Producto terminado",
  PRODUCT = "Producto",
  LOT = "Categoría de lote"
}

// Normaliza el idType entre create (numérico) y edit (el listado entrega el nombre en category.type).
export const categoryTypeIdByLabel: Record<string, CategoryType> = {
  [CategoryTypeName.FEEDSTOCK]: CategoryType.FEEDSTOCK,
  [CategoryTypeName.PACKAGING]: CategoryType.PACKAGING,
  [CategoryTypeName.FINISHED_PRODUCT]: CategoryType.FINISHED_PRODUCT,
  [CategoryTypeName.PRODUCT]: CategoryType.FINISHED_PRODUCT,
  [CategoryTypeName.LOT]: CategoryType.LOT
};

export enum MaterialTypeKey {
  FEEDSTOCK = "materia_prima",
  PACKAGING = "packaging"
}

export enum DniTTypesFormat {
  "cedula" = "Cédula de Ciudadanía",
  "cedula de extranjeria" = "Cédula de Extranjería",
  "pasaporte" = "Pasaporte",
  "permiso especial de permanencia" = "Permiso Especial de Permanencia"
}

export function getDniTypeLabel(dniType: string): string | undefined {
  if (dniType in DniTTypesFormat) {
    return DniTTypesFormat[dniType as keyof typeof DniTTypesFormat];
  }

  return undefined;
}
