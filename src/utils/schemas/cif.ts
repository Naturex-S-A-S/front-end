import * as yup from "yup";

export const cifTypeSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    costBasis: yup
      .string()
      .oneOf(["fixed", "per_kg"], "Seleccione una opción")
      .required("La base de costo es requerida"),
    active: yup.boolean().required("El estado es requerido")
  })
  .required();

export const periodSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    month: yup
      .number()
      .typeError("Requerido")
      .min(1, "Mes inválido")
      .max(12, "Mes inválido")
      .required("El mes es requerido"),
    year: yup
      .number()
      .typeError("Requerido")
      .min(2020, "Año inválido")
      .max(2100, "Año inválido")
      .required("El año es requerido"),
    startDate: yup.date().nullable().typeError("Fecha inválida").required("La fecha de inicio es requerida"),
    endDate: yup.date().nullable().typeError("Fecha inválida").required("La fecha de fin es requerida"),
    notes: yup.string().nullable().notRequired()
  })
  .required();
