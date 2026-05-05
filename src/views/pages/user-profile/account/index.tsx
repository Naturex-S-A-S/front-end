import { useEffect } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { yupResolver } from '@hookform/resolvers/yup'

import toast from 'react-hot-toast'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomCard from '@/@core/components/mui/Card'
import type { ProfileData } from '@/types/pages/profile'
import { putProfile } from '@/api/user/profile'
import CustomButton from '@/@core/components/mui/Button'
import { updateProfileSchema } from '@/utils/schemas/profile'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { alertMessageErrors } from '@/utils/messages'

const Account = ({ data }: { data: ProfileData }) => {
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    register,
    reset,
    formState: { defaultValues, errors },
    control
  } = useForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      role: null,
      address: '',
      dni: '',
      dniType: ''
    },
    mode: 'onChange',
    resolver: yupResolver(updateProfileSchema)
  })

  useEffect(() => {
    reset({
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data?.phone,
      role: {
        value: data.role?.id,
        label: data.role?.name
      },
      address: data?.address,
      dni: data.dni,
      dniType: data.dniType
    })
  }, [reset, data])

  const { mutate, isPending } = useMutation({
    mutationFn: putProfile,
    onSuccess: () => {
      toast.success('Perfil actualizado con éxito')

      queryClient.invalidateQueries({ queryKey: ['getProfile'] })
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al actualizar el perfil')
    }
  })

  const onSubmit = (values: any) => {
    mutate({
      ...values
    })
  }

  return (
    <CustomCard title='Configuración de la Cuenta'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4} justifyContent={'center'}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              {...register('name')}
              name='name'
              label='Nombre'
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              {...register('lastName')}
              name='lastName'
              label='Apellido'
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              {...register('email')}
              name='email'
              label='Email'
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('phone')} name='phone' label='Teléfono' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name='role'
              control={control}
              render={({ field }) => (
                <CustomAutocomplete
                  {...field}
                  disabled={true}
                  options={defaultValues?.role ? [defaultValues.role] : []}
                  getOptionLabel={(option: any) => option?.label ?? ''}
                  renderInput={params => <CustomTextField {...params} label='Rol' placeholder='Seleccione un rol' />}
                  onChange={(_, value) => field.onChange(value)}
                />
              )}
            />
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
