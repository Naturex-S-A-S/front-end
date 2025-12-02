import React from 'react'

import { Grid } from '@mui/material'

import { useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomCard from '@/@core/components/mui/Card'
import TextFieldPassword from '@/components/layout/shared/TextFieldPassword'
import CustomButton from '@/@core/components/mui/Button'
import { changePasswordSchema } from '@/utils/schemas/user'

const ChangePassword = () => {
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(changePasswordSchema)
  })

  const handleOnSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <CustomCard title='Cambiar contraseña'>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent='center'>
              <Grid item xs={4}>
                <TextFieldPassword register={register} errors={errors} name='password' label='Contraseña Actual' />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent='center'>
              <Grid item xs={4}>
                <TextFieldPassword register={register} errors={errors} name='newPassword' label='Nueva Contraseña' />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent='center'>
              <Grid item xs={4}>
                <TextFieldPassword
                  register={register}
                  errors={errors}
                  name='newConfirmPassword'
                  label='Confirmar Nueva Contraseña'
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12} className='flex justify-center'>
              <CustomButton text='Guardar' type='submit' isLoading={false} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </CustomCard>
  )
}

export default ChangePassword
