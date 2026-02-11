import * as yup from "yup"

export const categorySchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        type: yup.object().shape({
            id: yup.string().required('El tipo es requerido'),
            label: yup.string().optional()
        }).required('El tipo es requerido')
    })
    .required()
