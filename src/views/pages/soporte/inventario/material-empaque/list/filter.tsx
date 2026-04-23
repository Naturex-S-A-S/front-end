// ...existing code...
import React from 'react'

import { useForm, Controller } from 'react-hook-form'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import useGetCategory from '@/hooks/packaging/useGetCategory'

type Filters = {
  category?: string
  allergen?: boolean
  active: boolean
  measureUnit?: {
    label: string
    value: string
  }
}

type FormValues = Filters

type Props = {
  defaultValues?: Filters
  onApplyFilters?: (filters: Filters) => void
}

const Filter = ({ defaultValues, onApplyFilters }: Props) => {
  const { categories } = useGetCategory()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues
  })

  const submit = (data: FormValues) => {
    onApplyFilters?.({
      category: data.category || undefined,
      allergen: data.allergen || undefined,
      active: data.active
    })
  }

  const clear = () => {
    reset(defaultValues)
    defaultValues && onApplyFilters && onApplyFilters(defaultValues)
  }

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems={'end'}>
          <Grid item xs={12} md={4} lg={4}>
            <Controller
              name='category'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={categories}
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

          <Grid item xs={12} md={4} lg={4}>
            <Controller
              name='active'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Activo'
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4} lg={4} height={'min-content'} display={'flex'} gap={1} justifyContent={'center'}>
            <CustomButton type='submit' variant='contained' size='small'>
              Aplicar
            </CustomButton>
            <CustomButton type='button' variant='outlined' size='small' onClick={clear}>
              Limpiar
            </CustomButton>
          </Grid>
        </Grid>
      </form>
    </CustomCard>
  )
}

export default Filter
