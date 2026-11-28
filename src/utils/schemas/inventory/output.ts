import * as yup from "yup";

const UNIT_TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, t: 1000000 };

const materialField = yup
  .object({
    id: yup.string().required("El material es requerido"),
    name: yup.string().required("El material es requerido")
  })
  .required("El material es requerido");

const unitField = yup
  .object()
  .shape({
    value: yup.string().required("La unidad es requerida"),
    label: yup.string().required("El label es requerido")
  })
  .required("La unidad es requerida");

const positiveQuantity = yup
  .number()
  .transform((value, original) => (original === "" || original === null ? undefined : value))
  .typeError("La cantidad debe ser un número")
  .positive("La cantidad debe ser mayor a 0")
  .required("La cantidad es requerida");

const integerQuantity = positiveQuantity.integer("La cantidad debe ser un número entero");

const orderField = yup
  .object({ id: yup.number().required("La orden es requerida") })
  .nullable()
  .required("La orden es requerida");

const requiredObservation = (message: string) => yup.string().trim().required(message);

// ─── Materia prima: un schema por tipo de salida ───

/** Producción (salida normal): el lote lo decide FEFO. */
export const outputProductionFeedstockSchema = yup.object({
  material: materialField,
  quantity: positiveQuantity,
  unit: unitField,
  observation: yup.string().optional()
});

/** Ajuste: consumo extra de una orden en proceso. La cantidad va en gramos. */
export const outputAdjustmentFeedstockSchema = yup.object({
  material: materialField,
  order: orderField,
  quantity: positiveQuantity,
  observation: requiredObservation("La observación es requerida para justificar el ajuste")
});

/** Descarte: un lote vencido, sin orden; la cantidad no puede superar el saldo del lote. */
export const outputDiscardFeedstockSchema = yup.object({
  material: materialField,
  lot: yup.object({ id: yup.number().required() }).nullable().required("Seleccione el lote vencido a descartar"),
  quantity: positiveQuantity.test("lot-balance", "La cantidad supera el saldo del lote", function (value) {
    const { lot, unit } = this.parent;

    if (!lot || value == null) return true;
    const grams = value * (UNIT_TO_GRAMS[unit?.value] ?? 1);

    return grams <= lot.currentQuantityG + 1e-9;
  }),
  unit: unitField,
  observation: requiredObservation("La observación es requerida para justificar el descarte")
});

// ─── Material de empaque: un schema por tipo de salida ───

/** Producción (salida normal): el lote lo decide FIFO. */
export const outputProductionPackagingSchema = yup.object({
  material: materialField,
  quantity: integerQuantity,
  observation: yup.string().optional()
});

/** Ajuste: consumo extra de una orden en proceso. */
export const outputAdjustmentPackagingSchema = yup.object({
  material: materialField,
  order: orderField,
  quantity: integerQuantity,
  observation: requiredObservation("La observación es requerida para justificar el ajuste")
});

/** Descarte de material defectuoso: cualquier lote con saldo, sin orden. */
export const outputDiscardPackagingSchema = yup.object({
  material: materialField,
  lot: yup.object({ id: yup.number().required() }).nullable().required("Seleccione el lote a descartar"),
  quantity: integerQuantity.test("lot-balance", "La cantidad supera el saldo del lote", function (value) {
    const { lot } = this.parent;

    return !lot || value == null || value <= lot.currentQuantity;
  }),
  observation: requiredObservation("Describa el defecto que justifica el descarte")
});

export const kardexProductOutputSchema = yup.object({
  product: yup.object().shape({
    id: yup.string().required("El material es requerido"),
    name: yup.string().required("El label es requerido")
  }),
  order: yup.number().typeError("La orden debe ser un número").required("El orden es requerido"),
  quantity: yup
    .string()
    .min(1, "La cantidad debe ser mayor o igual a 1")
    .typeError("La cantidad debe ser un número")
    .required("La cantidad es requerida"),
  batch: yup.string().required("El lote es requerido"),
  observation: yup.string().optional()
});
