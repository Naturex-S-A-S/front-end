import { Grid } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomButton from '@/@core/components/mui/Button'
import CustomTextField from '@/@core/components/mui/TextField'
import { mockCategoryTypes } from '@/utils/mocks'

interface Props {
  isPending: boolean
}

const Form = ({ isPending }: Props) => {
  const {
    control,
    formState: { errors },
    register
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
          helperText={errors.name?.message as string}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='type'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={mockCategoryTypes}
              onChange={(e, value: any) => {
                onChange(value)
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Tipo'
                  placeholder='Seleccione un tipo'
                  error={!!errors.type}
                  helperText={errors.type?.id?.message as string}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  )
}

export default Form
