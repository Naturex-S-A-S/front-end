export enum MaterialType {
  FEEDSTOCK = "FEEDSTOCK",
  PACKAGING = "PACKAGING"
}

export enum CategoryType {
  FEEDSTOCK = "1",
  PACKAGING = "2"
}

export enum CategoryTypeName {
  FEEDSTOCK = "Materia prima",
  PACKAGING = "Material de empaque"
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
