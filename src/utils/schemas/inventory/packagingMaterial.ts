import * as yup from "yup"

export const packagingMaterialSchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        minimumStandard: yup.number().min(0, 'El minimo estandar debe ser mayor o igual a 0').typeError('El minimo estandar debe ser un número').required('El minimo estandar es requerido'),
        color: yup.string().optional(),
    })
    .required()
