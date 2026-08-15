import * as yup from "yup";

export const costConfigSchema = yup
  .object({
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
  })
  .required();

export const costEstimateSchema = yup
  .object({
    productId: yup.string().required("Seleccione un producto"),
    quantityKg: yup.number().typeError("Requerido").min(0.1, "Mínimo 0.1 kg").required("Requerido"),
    notes: yup.string().nullable()
  })
  .required();

export type RegisterPriceMaterialInput = {
  idMaterial: number;
  materialType: string;
  quantity: number | string;
  unitCost: number | null;
};

export type RegisterPriceFormValues = {
  wastePct: number;
  taxPct: number;
  applyTax: boolean;
  finalPrice: number;
  priceNotes: string;
  isDefinitive: boolean;
  materials: RegisterPriceMaterialInput[];
};

export const registerPriceSchema = yup
  .object({
    wastePct: yup.number().typeError("Requerido").min(0, "Mínimo 0%").max(100, "Máximo 100%").required("Requerido"),
    taxPct: yup.number().typeError("Requerido").min(0, "Mínimo 0%").max(100, "Máximo 100%").required("Requerido"),
    applyTax: yup.boolean().required(),
    finalPrice: yup.number().typeError("Requerido").positive("Debe ser mayor que 0").required("Requerido"),
    priceNotes: yup.string().optional(),
    isDefinitive: yup.boolean().required(),
    materials: yup
      .array()
      .of(
        yup.object({
          idMaterial: yup.number().typeError("Requerido").required("Requerido"),
          materialType: yup
            .string()
            .oneOf(["feedstock", "packaging"], "Tipo de material inválido")
            .required("Requerido"),
          quantity: yup.string().typeError("Requerido").min(0, "Mínimo 0").required("Requerido"),
          unitCost: yup.number().typeError("Requerido").nullable()
        })
      )
      .min(1, "Debe existir al menos un material")
      .required("Requerido")
  })
  .required();
