import * as yup from "yup";

export const costConfigSchema = yup.object({
  cifAveragingMonths: yup
    .number()
    .typeError("Requerido")
    .min(1, "Mínimo 1 mes")
    .max(60, "Máximo 60 meses")
    .required("Requerido"),
  defaultWastePct: yup
    .number()
    .typeError("Requerido")
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%")
    .required("Requerido"),
  defaultMarginPct: yup
    .number()
    .typeError("Requerido")
    .min(0, "Mínimo 0%")
    .max(1000, "Máximo 1000%")
    .required("Requerido")
}).required();

export const costEstimateSchema = yup.object({
  productId: yup.string().required("Seleccione un producto"),
  quantityKg: yup
    .number()
    .typeError("Requerido")
    .min(0.1, "Mínimo 0.1 kg")
    .required("Requerido"),
  notes: yup.string().nullable()
}).required();
