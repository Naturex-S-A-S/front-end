import React, { useEffect, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateButton from '@/components/layout/shared/CreateButton'
import CustomDialog from '@/@core/components/mui/Dialog'
import Form from './form'
import { productSchema } from '@/utils/schemas/inventory/product'
import { postProduct } from '@/api/product'
import { alertMessageErrors } from '@/utils/messages'

const Create = () => {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const toogleDialog = () => {
    setOpen(!open)
  }

  const methods = useForm({
    defaultValues: {
      id: undefined,
      name: undefined,
      measurement: undefined,
      unit: undefined,
      minimumStandard: undefined
    },

    resolver: yupResolver(productSchema)
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: postProduct,
    onSuccess: () => {
      toast.success('Producto creado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getProducts'] })
      queryClient.invalidateQueries({ queryKey: ['productList'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al crear el producto')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values,
      unit: values.unit.id
    })
  }

  return (
    <div>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Producto'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form isPending={isPending} />
          </form>
        </FormProvider>
      </CustomDialog>
    </div>
  )
}

export default Create
