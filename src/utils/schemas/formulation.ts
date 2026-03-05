import * as yup from "yup"

export const formulationSchema = yup
    .object({
        name: yup.string().required('El nombre es requerido'),
        comment: yup.string().required('El comentario es requerido'),
        products: yup.array().of(yup.object().shape({
            id: yup.string().required('El ID del producto es requerido')
        })),
        details: yup
            .array()
            .required('Los detalles son requeridos')
            .test(
                'validate-details-except-last',
                'Debe agregar al menos un detalle',
                async function (value) {
                    const { path, createError } = this
                    const arr = Array.isArray(value) ? value : []

                    if (arr.length === 0) {
                        return createError({ path, message: 'Debe agregar al menos un detalle' })
                    }

                    const itemSchema = yup.object().shape({
                        material: yup.object().shape({
                            id: yup.string().required('El material es requerido')
                        }).required('El material es requerido'),
                        quantity: yup.number().typeError('La cantidad debe ser válida').test('required', 'La cantidad es requerida', value => value !== undefined && value !== null).min(1, 'La cantidad debe ser al menos 1')
                    })

                    // Validate all items except the last one
                    const toValidate = arr.slice(0, -1)

                    for (let i = 0; i < toValidate.length; i++) {
                        try {
                            await itemSchema.validate(toValidate[i])
                        } catch (err: any) {
                            return createError({
                                path: `${path}[${i}]`,
                                message: err.message
                            })
                        }
                    }

                    return true
                }
            ),
    })
    .required()

export const formulationVersionSchema = yup
    .object({
        comment: yup.string().required('El comentario es requerido'),
        details: yup
            .array()
            .required('Los detalles son requeridos')
            .test(
                'validate-details-except-last',
                'Debe agregar al menos un detalle',
                async function (value) {
                    const { path, createError } = this
                    const arr = Array.isArray(value) ? value : []

                    if (arr.length === 0) {
                        return createError({ path, message: 'Debe agregar al menos un detalle' })
                    }

                    const itemSchema = yup.object().shape({
                        material: yup.object().shape({
                            id: yup.string().required('El material es requerido')
                        }).required('El material es requerido'),
                        quantity: yup.number().typeError('La cantidad debe ser válida').test('required', 'La cantidad es requerida', value => value !== undefined && value !== null).min(1, 'La cantidad debe ser al menos 1')
                    })

                    for (let i = 0; i < arr.length; i++) {
                        try {
                            await itemSchema.validate(arr[i])
                        } catch (err: any) {
                            return createError({
                                path: `${path}[${i}]`,
                                message: err.message
                            })
                        }
                    }

                    return true
                }
            ),
    })
    .required()
