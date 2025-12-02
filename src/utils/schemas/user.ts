import * as yup from "yup"

export const createUserSchema = yup
    .object({
        dni: yup.string().required('El documento de identidad es requerido'),
        dniType: yup.object().shape({
            value: yup.string().required('El tipo de documento es requerido')
        }).required('El tipo de documento es requerido'),
        name: yup.string().required('El nombre es requerido'),
        lastName: yup.string().required('El apellido es requerido'),
        email: yup.string().email('El correo no es válido').required('El correo es requerido'),
        address: yup.string().required('La dirección es requerida'),
        phone: yup.string().required('El teléfono es requerido'),
        password: yup.string().required('La contraseña es requerida'),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
            .required('La confirmación de la contraseña es requerida'),
        roleId: yup.object().shape({
            value: yup.number().required('El rol es requerido')
        }).required('El rol es requerido'),
    })
    .required()
