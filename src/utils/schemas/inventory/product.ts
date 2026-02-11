import * as yup from "yup"

export const productSchema = yup
    .object({
        id: yup.string().required('El id es requerido'),
        name: yup.string().required('El nombre es requerido'),
        minimumStandard: yup.number().min(0, 'El minimo estandar debe ser mayor o igual a 0').typeError('El minimo estandar debe ser un número').required('El minimo estandar es requerido'),
        unit: yup.object().shape({
            label: yup.string().required('La etiqueta de la medida es requerida'),
            value: yup.string().required('La medida es requerida'),

        }),
        measurement: yup.string().required('La unidad es requerida')
    })
    .required()
