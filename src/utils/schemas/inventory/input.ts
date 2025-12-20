import * as yup from "yup"

export const inputKardexSchema = yup
    .object({
        material: yup.object().shape({
            value: yup.string().required('El material es requerido'),
            label: yup.string().required('El label es requerido')
        }),
        provider: yup.object().shape({
            value: yup.string().required('El proveedor es requerido'),
            label: yup.string().required('El label es requerido')
        }),
        quantity: yup.string().min(1, 'La cantidad debe ser mayor o igual a 1').typeError('La cantidad debe ser un número').required('La cantidad es requerida'),
        unit: yup.object().shape({
            value: yup.string().required('La unidad es requerida'),
            label: yup.string().required('El label es requerido')
        }),
        charge: yup.string().typeError('El cargo debe ser un número').required('El cargo es requerido'),
        expirationDate1: yup.date().required('La fecha de expiración es requerida'),
    })
    .required()
