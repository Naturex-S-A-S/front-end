import { useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { yupResolver } from '@hookform/resolvers/yup'

import toast from 'react-hot-toast'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomCard from '@/@core/components/mui/Card'
import type { UpdateProfilePayload } from '@/types/pages/profile'
import { putProfile } from '@/api/user'
import CustomButton from '@/@core/components/mui/Button'
import { updateProfileSchema } from '@/utils/schemas/profile'

const Account = ({ data }: { data: UpdateProfilePayload }) => {
  const queryClient = useQueryClient()

  const defaultValues = useMemo(() => {
    return {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      address: data.address,
      dni: data.dni,
      dniType: data.dniType
    }
  }, [data])

  const { handleSubmit, register, reset } = useForm({
    defaultValues: defaultValues,
    mode: 'onChange',
    resolver: yupResolver(updateProfileSchema)
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: putProfile,
    onSuccess: () => {
      toast.success('Perfil actualizado con éxito')

      queryClient.invalidateQueries({ queryKey: ['getProfile'] })
    },
    onError: () => {
      toast.error('Error al actualizar el perfil')
    }
  })

  const onSubmit = (values: UpdateProfilePayload) => {
    mutate({
      ...values,
      password: '123456'
    })
  }

  return (
    <CustomCard title='Configuración de la Cuenta'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4} justifyContent={'center'}>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('name')} name='name' label='Nombre' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('lastName')} name='lastName' label='Apellido' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('email')} name='email' label='Email' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('phone')} name='phone' label='Teléfono' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('role')} name='role' label='Rol' disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('address')} name='address' label='Dirección' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('dni')} name='dni' label='Documento de Identidad' disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('dniType')} name='dniType' label='Tipo de Documento' disabled />
          </Grid>

          <Grid item xs={12} className='flex justify-center'>
            <CustomButton isLoading={isPending} text='Guardar' type='submit' />
          </Grid>
        </Grid>
      </form>
    </CustomCard>
  )
}

export default Account
