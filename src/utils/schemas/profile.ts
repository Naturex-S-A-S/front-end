import * as yup from "yup"

export const updateProfileSchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        lastName: yup.string().required('El apellido es requerido'),
        email: yup.string().email('El correo no es válido').required('El correo es requerido'),
        address: yup.string().optional(),
        phone: yup.string().optional(),
        role: yup.object().shape({
            value: yup.number().required('El rol es requerido'),
            label: yup.string().required('El label es requerido')
        }).notRequired(),
        dni: yup.string().notRequired().nullable(),
        dniType: yup.string().notRequired().nullable()
    })
    .required()
