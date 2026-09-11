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
    ),
    expirationDate1: yup.date().required("La fecha de expiración es requerida")
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

export const adjustmentPackagingSchema = yup.object({
  category: baseCategory.test(
    "is-packaging",
    "La categoría debe ser material",
    (val: any) => val?.id === 1
  ),
  material: yup.object().nullable().required("Seleccione un material"),
  type: yup.string().nullable().oneOf(["IN", "OUT"]).required("Seleccione entrada o salida"),
  quantity: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser un entero")
    .min(1, "Cantidad mínima 1")
    .required("Ingrese la cantidad"),
  batch: yup.string().nullable().required("Ingrese el batch"),
  observation: yup.string().nullable().required("Ingrese una observación"),
  expiration_date_1: yup.string().nullable().notRequired(),
  rack: yup.object().nullable().required("Seleccione una estantería")
});

export const adjustmentFeedstockSchema = yup.object({
  category: baseCategory.test(
    "is-feedstock",
    "La categoría debe ser material",
    (val: any) => val?.id === 2
  ),
  material: yup.object().nullable().required("Seleccione un material"),
  type: yup.string().nullable().oneOf(["IN", "OUT"]).required("Seleccione entrada o salida"),
  quantity: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser un entero")
    .min(1, "Cantidad mínima 1")
    .required("Ingrese la cantidad"),
  batch: yup.string().nullable().required("Ingrese el batch"),
  observation: yup.string().nullable().required("Ingrese una observación"),
  expiration_date_1: yup.string().nullable().required("Ingrese la fecha de expiración"),
  rack: yup.object().nullable().required("Seleccione una estantería")
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
