import { useForm } from 'react-hook-form'

import { Button, Grid } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import CardComponent from '@/components/layout/shared/CardComponent'

const Account = () => {
  const { handleSubmit, register } = useForm({
    defaultValues: {
      name: 'John Doe',
      lastName: 'Doe',
      email: 'user@camilo.com',
      phone: '+57 314 517 0000',
      role: 'role for users',
      address: 'Urbanizacion Rosales de terranova. Bello, Antioquia.',
      dni: '126',
      dniType: 'cedula'
    }
  })

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <CardComponent title='Configuración de la Cuenta'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
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
            <CustomTextField {...register('role')} name='role' label='Rol' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('address')} name='address' label='Dirección' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('dni')} name='dni' label='Documento de Identidad' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField {...register('dniType')} name='dniType' label='Tipo de Documento' />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button type='submit' variant='contained' color='primary'>
              Guardar Cambios
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardComponent>
  )
}

export default Account
