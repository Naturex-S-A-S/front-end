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
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import { alertMessageErrors } from '@/utils/messages'
import { supplierDefaultValues } from '@/utils/defaultValues/supplier'
import { supplierSchema } from '@/utils/schemas/supplier'
import { postProvider } from '@/api/providers'

const Create = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const canCreateFormulation = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION,
    ABILITY_FIELDS.SUPPLIERS
  )

  const toogleDialog = () => {
    setOpen(!open)
  }

  const methods = useForm({
    defaultValues: supplierDefaultValues,
    resolver: yupResolver(supplierSchema)
  })

  const { handleSubmit, reset } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postProvider,
    onSuccess: () => {
      toast.success('Proveedor creado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getProviders'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al crear el proveedor')
    }
  })

  const onSubmit = (values: any) => {
    const req = {
      name: values.name,
      address: values.address,
      phone: values.phone
    }

    mutate(req)
  }

  if (!canCreateFormulation) return null

  return (
    <Box>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Proveedor'>
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
