// ...existing code...
import React from 'react'

import { useForm, Controller } from 'react-hook-form'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import { mockUnitWeight } from '@/utils/mocks'
import useGetCategory from '@/hooks/feedstock/useGetCategory'

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
  onClear?: () => void
}

const Filter = ({ defaultValues, onApplyFilters, onClear }: Props) => {
  const { categories } = useGetCategory()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues
  })

  const submit = (data: FormValues) => {
    onApplyFilters?.({
      category: data.category || undefined,
      allergen: data.allergen || undefined,
      active: data.active,
      measureUnit: data.measureUnit || undefined
    })
  }

  const clear = () => {
    reset(defaultValues)
    onClear?.()
    onApplyFilters && defaultValues && onApplyFilters(defaultValues)
  }

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems={'end'}>
          <Grid item xs={12} md={6} lg={3}>
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

          <Grid item xs={12} md={6} lg={3}>
            <Controller
              name='measureUnit'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={mockUnitWeight}
                  onChange={(e, value: any) => {
                    onChange(value)
                  }}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Unidad de medida'
                      placeholder='Seleccione una unidad de medida'
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Controller
              name='allergen'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Alergeno'
                />
              )}
            />
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

          <Grid item xs={12} md={6} lg={3} height={'min-content'} display={'flex'} gap={1} justifyContent={'center'}>
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
