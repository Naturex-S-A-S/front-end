import * as yup from "yup"

export const orderSchema = yup
    .object({
        presentations: yup.array().of(
            yup.object().shape({
                id: yup.string().required('El ID de la presentación es requerido'),
                quantityG: yup.number().typeError('La cantidad debe ser un número').min(0, 'La cantidad debe ser al menos 0').required('La cantidad es requerida')
            })
        ),
        batch: yup.string().required('El batch es requerido'),
        expirationDate1: yup.date().required('La fecha de expiración es requerida')
    })
    .required()

const baseCategory = yup
    .object()
    .shape({
        id: yup.number().required(),
        label: yup.string().required()
    })
    .required('Seleccione una categoría')

export const categoryOnlySchema = yup.object({
    category: yup
        .object({
            id: yup.number().required(),
            label: yup.string().required()
        })
        .required('Seleccione una categoría')
})

export const adjustmentMaterialSchema = yup.object({
    category: baseCategory.test('is-material', 'La categoría debe ser material', (val: any) => val?.id === 1),
    material: yup.object().nullable().required('Seleccione un material'),
    type: yup.string().nullable().oneOf(['IN', 'OUT']).required('Seleccione entrada o salida'),
    quantity: yup
        .number()
        .typeError('Debe ser un número')
        .integer('Debe ser un entero')
        .min(1, 'Cantidad mínima 1')
        .required('Ingrese la cantidad'),
    batch: yup.string().nullable().required('Ingrese el batch'),
    observation: yup.string().nullable().required('Ingrese una observación'),
    expiration_date_1: yup.string().nullable().notRequired(),
    location: yup.string().nullable().notRequired(),
    rack: yup.string().nullable().notRequired(),
})

export const adjustmentProductSchema = yup.object({
    category: baseCategory.test('is-product', 'La categoría debe ser producto', (val: any) => val?.id === 2),
    product: yup.object().nullable().required('Seleccione un producto'),
    quantity: yup
        .number()
        .typeError('Debe ser un número')
        .integer('Debe ser un entero')
        .min(1, 'Cantidad mínima 1')
        .required('Ingrese la cantidad'),
    location: yup.string().nullable().required('Debe ingresar el lugar de almacenamiento'),
    observation: yup.string().nullable().required('Ingrese una observación'),
    batch: yup.string().nullable().required('Ingrese el batch'),
    rack: yup.string().nullable().notRequired(),
    expiration_date_1: yup.string().nullable().required('Ingrese la fecha de expiración')
})

