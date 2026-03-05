import * as yup from "yup"

export const supplierSchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        address: yup.string().optional(),
        phone: yup.string().optional(),
    })
    .required()
