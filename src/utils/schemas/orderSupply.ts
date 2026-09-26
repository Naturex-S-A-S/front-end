import * as yup from "yup";

export const orderSupplySchema = yup
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