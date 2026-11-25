import * as yup from "yup";

export const orderSchema = yup
  .object({
    presentations: yup.array().of(
      yup.object().shape({
        id: yup.string().required("El ID de la presentación es requerido"),
        quantityG: yup
          .number()
          .typeError("La cantidad debe ser un número")
          .min(0, "La cantidad debe ser al menos 0")
          .required("La cantidad es requerida")
      })
    )
  })
  .required();

const baseCategory = yup
  .object()
  .shape({
    id: yup.number().required(),
    label: yup.string().required()
  })
  .required("Seleccione una categoría");

export const categoryOnlySchema = yup.object({
  category: yup
    .object({
      id: yup.number().required(),
      label: yup.string().required()
    })
    .required("Seleccione una categoría")
});

/**
 * Campos comunes del ajuste de MP y ME. En la entrada (devolución) se elige el lote que la
 * orden consumió y la cantidad no puede superar lo devolvible de ese lote; en la salida el
 * lote lo decide el sistema (FEFO en MP, FIFO en ME).
 */
const materialAdjustmentFields = {
  material: yup.object().nullable().required("Seleccione un material"),
  type: yup.string().nullable().oneOf(["IN", "OUT"]).required("Seleccione entrada o salida"),
  lot: yup
    .object()
    .nullable()
    .when("type", {
      is: "IN",
      then: schema => schema.required("Seleccione el lote al que se devuelve el material"),
      otherwise: schema => schema.notRequired()
    }),
  quantity: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser un entero")
    .min(1, "Cantidad mínima 1")
    .required("Ingrese la cantidad")
    .test("returnable", "La cantidad supera lo que se puede devolver de este lote", function (value) {
      const { type, lot } = this.parent;

      return type !== "IN" || !lot || value == null || value <= lot.quantityReturnable;
    }),
  observation: yup.string().nullable().required("Ingrese una observación"),
  rack: yup.object().nullable().required("Seleccione una estantería")
};

export const adjustmentPackagingSchema = yup.object({
  category: baseCategory.test(
    "is-packaging",
    "La categoría debe ser material",
    (val: any) => val?.id === 1
  ),
  ...materialAdjustmentFields
});

export const adjustmentFeedstockSchema = yup.object({
  category: baseCategory.test(
    "is-feedstock",
    "La categoría debe ser material",
    (val: any) => val?.id === 2
  ),
  ...materialAdjustmentFields
});

// Alias legacy: empaque (sin fecha requerida). Preferir los schemas específicos.
export const adjustmentMaterialSchema = adjustmentPackagingSchema;

export const adjustmentProductSchema = yup.object({
  category: baseCategory.test("is-product", "La categoría debe ser producto", (val: any) => val?.id === 3),
  product: yup.object().nullable().required("Seleccione un producto"),
  quantity: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser un entero")
    .min(1, "Cantidad mínima 1")
    .required("Ingrese la cantidad"),
  observation: yup.string().nullable().required("Ingrese una observación"),
  batch: yup.string().nullable().required("Ingrese el batch"),
  rack: yup.object().shape({ id: yup.string() }).optional(),
  expiration_date_1: yup.string().nullable().required("Ingrese la fecha de expiración")
});
