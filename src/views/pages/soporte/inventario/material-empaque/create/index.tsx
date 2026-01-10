import React, { useEffect, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateButton from '@/components/layout/shared/CreateButton'
import CustomDialog from '@/@core/components/mui/Dialog'
import Form from './form'
import { packagingMaterialSchema } from '@/utils/schemas/inventory/packagingMaterial'
import { postPackaging } from '@/api/packaging'

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
      color: ''
    },

    resolver: yupResolver(packagingMaterialSchema)
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: postPackaging,
    onSuccess: () => {
      toast.success('Material de empaque creado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getPackaging'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      toast.error(JSON.stringify(error?.response?.data?.message) || 'Error al crear el material de empaque')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values
    })
  }

  return (
    <div>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Material de Empaque'>
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
