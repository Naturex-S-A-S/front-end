export const ABILITY_SUBJECT = {
  PACKAGING: "Material de empaque",
  FEEDSTOCK: "Materia prima",
  PRODUCT: "Producto terminado",
  GENERAL_PARAMETERS: "Parámetros generales",
  PRODUCTION: "Producción",
  FINANCE_AND_ADMINISTRATION: "Finanzas y administración"
};

export const ABILITY_FIELDS = {
  LISTADO: "Listado",
  ENTRADAS: "Control de entradas",
  SALIDAS: "Control de salidas",
  MOVIMIENTOS: "Historial de movimientos",
  CATEGORIES: "Categorias",
  COLOR: "Color",
  BODEGAS: "Bodegas",
  FORMULATION: "Formulación",
  SUPPLIERS: "Proveedores",
  ORDERS: "Ordenes",
  PROVISIONING: "Aprovisionamiento"
};

export const ABILITY_ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage"
};

export const STATUS_COLOR: Record<string, "warning" | "success" | "error" | "default"> = {
  en_proceso: "warning",
  finalizada: "success",
  cancelada: "error"
};

export const STATUS_LABEL: any = {
  en_proceso: "En proceso",
  finalizada: "Completada",
  cancelada: "Cancelada"
};
