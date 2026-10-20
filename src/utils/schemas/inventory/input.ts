import * as yup from "yup";

export const kardexFeedstockInputSchema = yup
  .object({
    material: yup.object().shape({
      id: yup.string().required("El material es requerido"),
      name: yup.string().required("El label es requerido")
    }),
    provider: yup.object().shape({
      id: yup.string().required("El proveedor es requerido"),
      name: yup.string().required("El label es requerido")
    }),
    quantity: yup
      .number()
      .typeError("La cantidad debe ser un número")
      .positive("La cantidad debe ser mayor a 0")
      .required("La cantidad es requerida"),
    unit: yup.object().shape({
      value: yup.string().required("La unidad es requerida"),
      label: yup.string().required("El label es requerido")
    }),
    charge: yup
      .number()
      .typeError("El valor debe ser un número")
      .positive("El valor debe ser mayor a 0")
      .required("El valor es requerido"),
    document: yup.string().optional(),
    batch: yup.string().required("El lote es requerido"),
    rack: yup.object().shape({ id: yup.string() }).optional(),
    expirationDate1: yup.date().required("La fecha de expiración es requerida"),
    expirationDate2: yup.date().optional()
  })
  .required();

export const kardexPackagingInputSchema = yup
  .object({
    material: yup.object().shape({
      id: yup.string().required("El material es requerido"),
      name: yup.string().required("El label es requerido")
    }),
    provider: yup.object().shape({
      id: yup.string().required("El proveedor es requerido"),
      name: yup.string().required("El label es requerido")
    }),
    quantity: yup
      .number()
      .typeError("La cantidad debe ser un número")
      .positive("La cantidad debe ser mayor a 0")
      .integer("La cantidad debe ser un número entero")
      .required("La cantidad es requerida"),
    charge: yup
      .number()
      .typeError("El valor debe ser un número")
      .positive("El valor debe ser mayor a 0")
      .required("El valor es requerido"),
    document: yup.string().optional(),
    batch: yup.string().required("El lote es requerido"),
    rack: yup.object().shape({ id: yup.string() }).optional()
  })
  .required();

export const kardexProductInputSchema = yup
  .object({
    product: yup.object().shape({
      id: yup.string().required("El material es requerido"),
      name: yup.string().required("El label es requerido")
    }),
    order: yup.number().typeError("La orden debe ser un número").required("El orden es requerido"),
    quantity: yup
      .number()
      .typeError("La cantidad debe ser un número")
      .positive("La cantidad debe ser mayor a 0")
      .integer("La cantidad debe ser un número entero")
      .required("La cantidad es requerida"),
    batch: yup.string().required("El lote es requerido"),
    rack: yup
      .object()
      .shape({ id: yup.string().required("La estantería es requerida") })
      .required("La estantería es requerida"),
    expirationDate1: yup.date().required("La fecha de expiración es requerida"),
    observation: yup.string().optional()
  })
  .required();
