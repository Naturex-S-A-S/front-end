import * as yup from "yup"

export const outputKardexSchema = yup
    .object({
        material: yup
            .object({
                id: yup.string().required('El material es requerido'),
                name: yup.string().required('El material es requerido'),
            })
            .required('El material es requerido'),
        quantity: yup.string().min(1, 'La cantidad debe ser mayor o igual a 1').typeError('La cantidad debe ser un número').required('La cantidad es requerida'),
        unit: yup.object().shape({
            value: yup.string().required('La unidad es requerida'),
            label: yup.string().required('El label es requerido')
        }).required('La unidad es requerida'),
        batch: yup.string().optional(),
    })
    .required()

export const kardexPackagingOutputSchema = yup.object({
    material: yup
        .object({
            id: yup.string().required('El material es requerido'),
            name: yup.string().required('El material es requerido'),
        })
        .required('El material es requerido'),
    quantity: yup.string().min(1, 'La cantidad debe ser mayor o igual a 1').typeError('La cantidad debe ser un número').required('La cantidad es requerida'),
    batch: yup.string().optional(),
})

export const kardexProductOutputSchema = yup.object({
    product: yup.object().shape({
        id: yup.string().required('El material es requerido'),
        name: yup.string().required('El label es requerido')
    }),
    order: yup.number().typeError('El orden debe ser un número').required('El orden es requerido'),
    quantity: yup.string().min(1, 'La cantidad debe ser mayor o igual a 1').typeError('La cantidad debe ser un número').required('La cantidad es requerida'),
    batch: yup.string().required('El lote es requerido'),
    observation: yup.string().optional()
})
