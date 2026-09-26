import * as yup from "yup";

import { CategoryType } from "@/utils/enum";

export const categorySchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    type: yup
      .object()
      .shape({
        id: yup.string().required("El tipo es requerido"),
        label: yup.string().optional()
      })
      .required("El tipo es requerido"),
    expirationMonths: yup.number().when("type", {
      is: (type: any) => type?.id === CategoryType.FINISHED_PRODUCT,
      then: schema =>
        schema
          .integer("Debe ser un número entero")
          .min(1, "Debe ser al menos 1 mes")
          .required("Los meses de vencimiento son requeridos"),
      otherwise: schema => schema.notRequired()
    }),
    codeIndicator: yup.string().when("type", {
      is: (type: any) => type?.id === CategoryType.PACKAGING,
      then: schema =>
        schema
          .min(1, "El indicativo de código es requerido")
          .max(4, "El indicativo de código no puede exceder 4 caracteres")
          .required("El indicativo de código es requerido"),
      otherwise: schema => schema.notRequired()
    }),
    dependsOnProduct: yup.boolean().optional().default(false),
    lotFormat: yup
      .object({
        id: yup.string().optional(),
        label: yup.string().optional()
      })
      .test("lotFormat-required", "El formato de lote es requerido", function (value) {
        const type = this.parent?.type;

        return !(type?.id === CategoryType.LOT && !value?.id);
      }),
    idIndicator: yup.string().when("type", {
      is: (type: any) => type?.id === CategoryType.FINISHED_PRODUCT,
      then: schema =>
        schema
          .matches(/^\d{2}$/, "El indicativo de id debe tener exactamente 2 dígitos")
          .required("El indicativo de id es requerido"),
      otherwise: schema => schema.notRequired()
    })
  })
  .required();

export const warehouseSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    address: yup.string().required("La dirección es requerida"),
    phone: yup.string()
  })
  .required();

export const rackSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    active: yup.boolean().required("El estado es requerido"),
    description: yup.string()
  })
  .required();
