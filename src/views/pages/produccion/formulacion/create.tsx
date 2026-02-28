'use client'
import { useState } from 'react'

import { Box } from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateButton from '@/components/layout/shared/CreateButton'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomDialog from '@/@core/components/mui/Dialog'
import Form from './form'
import { formulationSchema } from '@/utils/schemas/formulation'
import { formulationDefaultValues } from '@/utils/defaultValues/formulation'
import { postFormulation } from '@/api/formulation'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'

const Create = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const canCreateFormulation = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.FORMULATION
  )

  const toogleDialog = () => {
    setOpen(!open)
  }

  const methods = useForm({
    defaultValues: formulationDefaultValues,
    resolver: yupResolver(formulationSchema)
  })

  const { handleSubmit, reset } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postFormulation,
    onSuccess: () => {
      toast.success('Fórmula creada con éxito')
      queryClient.invalidateQueries({ queryKey: ['getFormulations'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear la fórmula')
    }
  })

  const onSubmit = (values: any) => {
    const details = values.details.slice(0, -1)

    const req = {
      name: values.name,
      comment: values.comment,
      active: true,
      details: details.map((detail: any) => ({ idMaterial: detail.material.id, quantity: detail.quantity })),
      products: values.products.map((product: any) => {
        return product.id
      })
    }

    mutate(req)
  }

  if (!canCreateFormulation) return null

  return (
    <Box>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Fórmula'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form isPending={isPending} />
          </form>
        </FormProvider>
      </CustomDialog>
    </Box>
  )
}

export default Create
