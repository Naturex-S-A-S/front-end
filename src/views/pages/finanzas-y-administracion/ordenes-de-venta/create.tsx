'use client'

import { type Resolver, FormProvider, useForm } from 'react-hook-form'

import { useMutation } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

import { postSaleOrderType1, postSaleOrderType2 } from '@/api/order'
import CustomCard from '@/@core/components/mui/Card'
import { Form } from './form'

const schema = yup.object({
  fileType: yup
    .object({
      id: yup.string().required('Tipo de archivo es requerido')
    })
    .required('Tipo de archivo es requerido'),
  file: yup.mixed<File>().nullable().required('Archivo es requerido')
})

type FormValues = {
  fileType: { id: string }
  file: File | null
}

const SALE_ORDER_TYPE_1 = 'remision_venta'
const SALE_ORDER_TYPE_2 = 'ventas_siigo'

const Create = () => {
  const methods = useForm<FormValues>({
    defaultValues: { fileType: undefined, file: null },
    resolver: yupResolver(schema) as Resolver<FormValues>
  })

  const { mutate } = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData()

      formData.append('file', data.file as Blob)

      if (data.fileType.id === SALE_ORDER_TYPE_1) {
        return await postSaleOrderType1(formData)
      } else if (data.fileType.id === SALE_ORDER_TYPE_2) {
        return await postSaleOrderType2(formData)
      }

      return Promise.reject(new Error('Tipo de archivo no válido'))
    },
    onSuccess: (result: any) => {
      methods.reset()

      toast.success(result)
    },
    onError: () => {
      toast.error('Error al procesar el archivo')
    }
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <CustomCard>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Form />
        </form>
      </FormProvider>
    </CustomCard>
  )
}

export default Create
