import * as yup from "yup"

export const userSchema = yup
    .object({
        dni: yup.string().required('El documento de identidad es requerido'),
        dniType: yup.object().shape({
            value: yup.string().required('El tipo de documento es requerido')
        }).required('El tipo de documento es requerido'),
        name: yup.string().required('El nombre es requerido'),
        lastName: yup.string().required('El apellido es requerido'),
        email: yup.string().email('El correo no es válido').required('El correo es requerido'),
        address: yup.string().optional(),
        phone: yup.string().optional(),
        roleId: yup.object().shape({
            value: yup.string().required('El rol es requerido')
        }).required('El rol es requerido'),
        password: yup.string().min(5, 'La contraseña debe tener al menos 5 caracteres').max(15, 'La contraseña debe tener menos de 15 caracteres').required('La contraseña es requerida'),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
            .required('La confirmación de la contraseña es requerida'),
    })
    .required()

export const updateUserSchema = yup
    .object({
        dni: yup.string().required('El documento de identidad es requerido'),
        dniType: yup.object().shape({
            value: yup.string().required('El tipo de documento es requerido')
        }).required('El tipo de documento es requerido'),
        name: yup.string().required('El nombre es requerido'),
        lastName: yup.string().required('El apellido es requerido'),
        email: yup.string().email('El correo no es válido').required('El correo es requerido'),
        address: yup.string().optional(),
        phone: yup.string().optional(),
        roleId: yup.object().shape({
            value: yup.string().required('El rol es requerido')
        }).required('El rol es requerido'),
    })
    .required()

export const changePasswordSchema = yup
    .object({
        password: yup.string().required('La contraseña es requerida'),
        newPassword: yup.string().min(5, 'La contraseña debe tener al menos 5 caracteres').max(15, 'La contraseña debe tener menos de 15 caracteres').required('La contraseña es requerida'),
        newConfirmPassword: yup.string()
            .oneOf([yup.ref('newPassword')], 'Las contraseñas deben coincidir')
            .required('La confirmación de la contraseña es requerida'),
    })
    .required()
