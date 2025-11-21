import * as yup from "yup"

export const loginSchema = yup
    .object()
    .shape({
        documentType: yup.object().shape({
            value: yup.string().required('Tipo de documento es requerido')
        }).required('Tipo de documento es requerido'),
        document: yup.string().required('Documento de identidad es requerido'),
        password: yup.string().required('Contraseña es requerida')
    })
    .required()
