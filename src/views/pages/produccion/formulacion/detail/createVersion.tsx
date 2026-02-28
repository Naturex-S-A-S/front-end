import React, { useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CustomDialog from '@/@core/components/mui/Dialog'
import CreateButton from '@/components/layout/shared/CreateButton'
import { formulationVersionDefaultValues } from '@/utils/defaultValues/formulation'
import { formulationVersionSchema } from '@/utils/schemas/formulation'
import Form from '../form'

import { postFormulationVersion } from '@/api/formulation'

interface Props {
  formulationId: number
}

const CreateVersion = ({ formulationId }: Props) => {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const methods = useForm({
    defaultValues: formulationVersionDefaultValues,
    resolver: yupResolver(formulationVersionSchema)
  })

  const toogleDialog = () => {
    setOpen(!open)
  }

  const { handleSubmit, reset } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postFormulationVersion,
    onSuccess: () => {
      toast.success('Fórmula creada con éxito')
      queryClient.invalidateQueries({
        queryKey: ['getFormulationById', formulationId]
      })
      reset(formulationVersionDefaultValues)
      toogleDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear una nueva versión')
    }
  })

  const onSubmit = (values: any) => {
    const details = values.details.slice(0, -1)

    const req = {
      idFormulation: formulationId,
      comment: values.comment,
      active: values.active,
      details: details.map((detail: any) => ({ idMaterial: detail.material.id, quantity: detail.quantity }))
    }

    mutate(req)
  }

  return (
    <div>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Versión'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form isPending={isPending} isNewVersion />
          </form>
        </FormProvider>
      </CustomDialog>
    </div>
  )
}

export default CreateVersion
