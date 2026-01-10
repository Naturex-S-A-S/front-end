import { Grid } from '@mui/material'

import { useFormContext } from 'react-hook-form'

import CustomButton from '@/@core/components/mui/Button'
import CustomTextField from '@/@core/components/mui/TextField'

type Props = {
  isPending: boolean
  isEdit?: boolean
}

const Form: React.FC<Props> = ({ isPending }) => {
  const {
    register,
    formState: { errors }
  }: any = useFormContext()

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('name')}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('minimumStandard')}
          autoFocus
          fullWidth
          type='number'
          label='Stock mínimo'
          placeholder='Ingrese el stock minimo'
          error={!!errors.minimumStandard}
          helperText={errors.minimumStandard?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('color')}
          autoFocus
          fullWidth
          label='Color'
          placeholder='Ingrese el color'
          error={!!errors.color}
          helperText={errors.color?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  )
}

export default Form
