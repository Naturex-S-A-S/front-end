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
import { userSchema } from '@/utils/schemas/user'
import { defaultUserValues } from '@/utils/defaultValues/user'
import { postUser } from '@/api/user'
import Form from './form'
import { alertMessageErrors } from '@/utils/messages'

const Create = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const toogleDialog = () => {
    setOpen(!open)
  }

  const methods = useForm({
    defaultValues: defaultUserValues,
    resolver: yupResolver(userSchema)
  })

  const { handleSubmit, reset } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postUser,
    onSuccess: () => {
      toast.success('Usuario creado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getUsers'] })
      reset()
      toogleDialog()
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al crear el usuario')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values,
      dniType: values.dniType.value,
      roleId: values.roleId.value
    })
  }

  if (!ability.can('create', 'Soporte', 'Usuarios')) return null

  return (
    <Box>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Usuario'>
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
