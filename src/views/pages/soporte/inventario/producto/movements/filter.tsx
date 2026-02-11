// ...existing code...
import React from 'react'

import { useForm, Controller } from 'react-hook-form'
import { Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import useGetProductList from '@/hooks/product/useGetProductList'

type Filters = {
  kardexType?: {
    label?: string
    value?: string
  } | null
  batch?: string
  product?: {
    name?: string
    id?: string
  } | null
  classification?: string
  orderId?: string
}

type FormValues = Filters

type Props = {
  defaultValues: Filters
  onApplyFilters: (filters: Filters) => void
  onClear?: () => void
}

const Filter = ({ defaultValues, onApplyFilters, onClear }: Props) => {
  const { productList } = useGetProductList()

  const { control, handleSubmit, reset, register } = useForm<FormValues>({
    defaultValues
  })

  const submit = (data: FormValues) => {
    onApplyFilters(data)
  }

  const clear = () => {
    reset(defaultValues)
    onClear?.()
    onApplyFilters(defaultValues)
  }

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems={'end'}>
          <Grid item xs={12} md={6} lg={3}>
            <Controller
              name='product'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={productList}
                  onChange={(e, value: any) => {
                    onChange(value)
                  }}
                  renderInput={params => (
                    <CustomTextField {...params} label='Producto' placeholder='Seleccione un producto' />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <CustomTextField {...register('batch')} label='Lote' placeholder='Ingrese el lote' />
          </Grid>

          <Grid item xs={12} md={6} lg={2}>
            <Controller
              name='kardexType'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={[
                    { label: 'Ingreso', value: 'input' },
                    { label: 'Egreso', value: 'output' }
                  ]}
                  onChange={(e, value: any) => {
                    onChange(value)
                  }}
                  renderInput={params => <CustomTextField {...params} label='Tipo' placeholder='Seleccione un tipo' />}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <CustomTextField
              {...register('classification')}
              label='Clasificacion'
              placeholder='Ingrese la clasificacion'
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <CustomTextField {...register('orderId')} label='Orden' placeholder='Ingrese la orden' />
          </Grid>

          <Grid item xs={12} md={6} lg={2} height={'min-content'} display={'flex'} gap={1} justifyContent={'center'}>
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
