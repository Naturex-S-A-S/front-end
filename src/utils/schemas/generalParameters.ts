import * as yup from "yup";

export const categorySchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    type: yup
      .object()
      .shape({
        id: yup.string().required("El tipo es requerido"),
        label: yup.string().optional()
      })
      .required("El tipo es requerido")
  })
  .required();

export const warehouseSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    address: yup.string().required("La dirección es requerida"),
    phone: yup.string().required("El teléfono es requerido")
  })
  .required();

export const rackSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    description: yup.string().required("La descripción es requerida")
  })
  .required();
