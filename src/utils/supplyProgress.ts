/**
 * Avance de un material de un aprovisionamiento contra lo que ha ingresado
 * (.docs/aprovisionamiento-ingresos/specs.md §4 del backend).
 */

export type SupplyStatus = "none" | "partial" | "complete";

const EPSILON = 1e-6;

export const SUPPLY_STATUS_LABEL: Record<SupplyStatus, string> = {
  none: "Sin ingresos",
  partial: "Parcial",
  complete: "Completo"
};

export const SUPPLY_STATUS_COLOR: Record<SupplyStatus, "secondary" | "warning" | "success"> = {
  none: "secondary",
  partial: "warning",
  complete: "success"
};

/** Igual que convertToGrams del backend: g, kg o t a gramos. Sin unidad o con otra unidad, deja el valor igual. */
export const toGrams = (quantity: number, unit?: string | null): number => {
  if (unit === "kg") return quantity * 1000;
  if (unit === "t") return quantity * 1_000_000;

  return quantity;
};

/** Lo que falta por llegar. Nunca es negativo: una sobre-entrega deja 0. */
export const supplyPending = (total: number, received: number): number => Math.max(0, total - received);

export const supplyStatus = (total: number, received: number): SupplyStatus => {
  if (received <= EPSILON) return "none";

  return supplyPending(total, received) <= EPSILON ? "complete" : "partial";
};

/** Definición de cada columna de la tabla de materiales, para los tooltips de los encabezados. */
export const SUPPLY_COLUMN_HELP = {
  available: "Lo que había en inventario de este material cuando se creó el aprovisionamiento. No cambia con las entradas.",
  missing: "Lo que faltaba en inventario para cubrir el total pedido cuando se creó el aprovisionamiento. No cambia con las entradas.",
  total: "Cantidad que requieren los productos seleccionados. Materia prima en gramos y empaque en unidades.",
  received:
    "Suma de las entradas de inventario registradas con esta orden. Los ajustes y devoluciones no cuentan. Las entradas en kg o t se suman en gramos.",
  pending: "Lo que falta por llegar: total pedido menos ingresada. Si llega de más queda en 0.",
  status: "Sin ingresos: no ha llegado nada. Parcial: llegó algo y aún hay pendiente. Completo: el pendiente es 0.",
  cost: "Costo total de la línea del aprovisionamiento."
} as const;
