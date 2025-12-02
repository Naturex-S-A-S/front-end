import * as yup from "yup"

export const updateProfileSchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        lastName: yup.string().required('El apellido es requerido'),
        email: yup.string().email('El correo no es válido').required('El correo es requerido'),
        address: yup.string().required('La dirección es requerida'),
        phone: yup.string().required('El teléfono es requerido'),
        role: yup.string().notRequired(),
        dni: yup.string().notRequired().nullable(),
        dniType: yup.string().notRequired().nullable()
    })
    .required()
