import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

import CustomButton from '@/@core/components/mui/Button'
import CustomTextField from '@/@core/components/mui/TextField'
import useGetCategory from '@/hooks/feedstock/useGetCategory'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'

type Props = {
  isPending: boolean
  isEdit?: boolean
}

const Form: React.FC<Props> = ({ isPending }) => {
  const { categories } = useGetCategory()

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext()

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={12}>
        <FormControlLabel control={<Checkbox {...register('allergen')} />} label='Alérgeno' />
      </Grid>
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
        <Controller
          name='category'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={categories}
              multiple
              onChange={(e, value: any) => {
                onChange(value)
              }}
              renderInput={params => (
                <CustomTextField {...params} label='Categoria' placeholder='Seleccione una categoria' />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('minimumStandard')}
          autoFocus
          fullWidth
          type='number'
          label='Stock mínimo (g)'
          placeholder='Ingrese el stock minimo'
          error={!!errors.minimumStandard}
          helperText={errors.minimumStandard?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  )
}

export default Form
