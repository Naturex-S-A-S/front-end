'use client'

import { useEffect } from 'react'

import { Box } from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import { useAbility } from '@/hooks/casl/useAbility'
import CustomDialog from '@/@core/components/mui/Dialog'
import { updateUserSchema } from '@/utils/schemas/user'
import { defaultUserValues } from '@/utils/defaultValues/user'
import { putUser } from '@/api/user'
import Form from './form'
import { documentTypeOptions } from '@/utils/data'

type Props = {
  open: boolean
  toogleDialog: () => void
  defaultValues: any
}

const Edit: React.FC<Props> = ({ open, toogleDialog, defaultValues }) => {
  const queryClient = useQueryClient()
  const ability = useAbility()

  const methods = useForm({
    defaultValues: defaultUserValues,
    reValidateMode: 'onChange',
    resolver: yupResolver(updateUserSchema)
  })

  const { handleSubmit } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: putUser,
    onSuccess: () => {
      toast.success('Usuario actualizado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getUsers'] })
      toogleDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar usuario')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values,
      dniType: values.dniType.value,
      roleId: values.roleId.value
    })
  }

  useEffect(() => {
    if (!open) return

    methods.reset({
      ...defaultValues,
      dniType: documentTypeOptions.find(option => option.value === defaultValues.dniType),
      roleId: {
        value: defaultValues.role.id,
        label: defaultValues.role.name,
        roleName: defaultValues.role.name
      }
    })
  }, [defaultValues, methods, open])

  if (!ability.can('update', 'Usuarios')) return null

  return (
    <Box>
      <CustomDialog open={open} toogleDialog={toogleDialog} title='Actualizar Usuario'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form isPending={isPending} isEdit />
          </form>
        </FormProvider>
      </CustomDialog>
    </Box>
  )
}

export default Edit
