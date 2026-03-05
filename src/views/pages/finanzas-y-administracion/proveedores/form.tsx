import { Grid } from '@mui/material'
import { useFormContext } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'

interface FormProps {
  isPending: boolean
  isEdit?: boolean
}

const Form = ({ isPending, isEdit = false }: FormProps) => {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('name')}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese un nombre para la fórmula'
          error={!!errors.name}
          helperText={errors.name?.message as string}
          disabled={isPending || isEdit}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('address')}
          fullWidth
          label='Dirección'
          placeholder='Ingrese la dirección del proveedor'
          error={!!errors.address}
          helperText={errors.address?.message as string}
          disabled={isPending || isEdit}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('phone')}
          fullWidth
          label='Teléfono'
          placeholder='Ingrese el teléfono del proveedor'
          error={!!errors.phone}
          helperText={errors.phone?.message as string}
          disabled={isPending || isEdit}
        />
      </Grid>

      {!isEdit && (
        <Grid item xs={12} className='flex justify-center'>
          <CustomButton text='Guardar' type='submit' isLoading={isPending} />
        </Grid>
      )}
    </Grid>
  )
}

export default Form
