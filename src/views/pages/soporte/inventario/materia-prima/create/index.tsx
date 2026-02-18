import React, { useEffect, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateButton from '@/components/layout/shared/CreateButton'
import CustomDialog from '@/@core/components/mui/Dialog'
import Form from './form'
import { rawMaterialSchema } from '@/utils/schemas/inventory/rawMaterial'
import { postFeedstock } from '@/api/feedstock'

const Create = () => {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const toogleDialog = () => {
    setOpen(!open)
  }

  const methods = useForm({
    defaultValues: {
      name: '',
      minimumStandard: 0,
      allergen: false
    },

    resolver: yupResolver(rawMaterialSchema)
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: postFeedstock,
    onSuccess: () => {
      toast.success('Materia prima creada con éxito')
      queryClient.invalidateQueries({ queryKey: ['getFeedstock'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear la materia prima')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values,
      category: values.category.map((item: any) => item.id)
    })
  }

  return (
    <div>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Materia Prima'>
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
