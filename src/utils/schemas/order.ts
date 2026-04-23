import * as yup from "yup"

export const orderSchema = yup
    .object({
        presentations: yup.array().of(
            yup.object().shape({
                id: yup.string().required('El ID de la presentación es requerido'),
                quantityG: yup.number().typeError('La cantidad debe ser un número').min(1, 'La cantidad debe ser al menos 1').required('La cantidad es requerida')
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
    charge: yup.string().required('Ingrese el valor'),
    quantity: yup
        .number()
        .typeError('Debe ser un número')
        .integer('Debe ser un entero')
        .min(1, 'Cantidad mínima 1')
        .required('Ingrese la cantidad'),
    observation: yup.string().nullable().notRequired(),
    batch: yup.string().nullable().notRequired(),
    rack: yup.string().nullable().notRequired(),
    expiration_date_1: yup.string().nullable().notRequired(),
    expiration_date_2: yup.string().nullable().notRequired()
})

export const adjustmentProductSchema = yup.object({
    category: baseCategory.test('is-product', 'La categoría debe ser producto', (val: any) => val?.id === 2),
    product: yup.object().nullable().required('Seleccione un producto'),
    type: yup.string().nullable().required('El tipo es requerido'),
    classification: yup.string().nullable().required('Ingrese una clasificación'),
    quantity: yup
        .number()
        .typeError('Debe ser un número')
        .integer('Debe ser un entero')
        .min(1, 'Cantidad mínima 1')
        .required('Ingrese la cantidad'),
    location: yup.string().nullable().required('Debe ingresar el lugar de almacenamiento'),
    observation: yup.string().nullable().notRequired(),
    batch: yup.string().nullable().notRequired(),
    rack: yup.string().nullable().notRequired(),
    expiration_date_1: yup.string().nullable().notRequired(),
    expiration_date_2: yup.string().nullable().notRequired()
})

