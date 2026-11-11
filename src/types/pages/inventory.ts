/** Tipo de salida del listado de MP y ME (SPEC FEFO §5.1 y §5.6). */
export type OutputType = "produccion" | "ajuste" | "descarte";

export const OUTPUT_TYPE_OPTIONS: { value: OutputType; label: string }[] = [
  { value: "produccion", label: "Producción" },
  { value: "ajuste", label: "Ajuste" },
  { value: "descarte", label: "Descarte" }
];

/** Lote de materia prima (GET /kardex/feedstock/lots). Solo los campos que usa el select del descarte. */
export interface IFeedstockBatch {
  id: number;
  idFeedstock: string;
  batch: string;
  expirationDate: string;
  dateCreated: string;
  initialQuantityG: number;
  currentQuantityG: number;
  unitCostG: number;
  idRack: string | null;
  expired: boolean;
}

/** Lote de material de empaque (GET /packaging-kardex/lots). */
export interface IPackagingBatch {
  id: number;
  idPackaging: string;
  batch: string | null;
  dateCreated: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
}
