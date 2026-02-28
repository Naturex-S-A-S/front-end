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
  product: undefined
}

type FormValues = Filters

type Props = {
  defaultValues?: Filters
  onApplyFilters?: (filters: any) => void
  onClear?: () => void
}

const Filter = ({ defaultValues, onApplyFilters, onClear }: Props) => {
  const { productList } = useGetProductList()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues
  })

  const submit = (data: any) => {
    onApplyFilters?.({
      productId: data.product?.id || undefined
    })
  }

  const clear = () => {
    reset(defaultValues)
    onClear?.()
    defaultValues && onApplyFilters && onApplyFilters(defaultValues)
  }

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems={'end'}>
          <Grid item xs={12} md={4} lg={4}>
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

          <Grid item xs={12} md={8} lg={8} height={'min-content'} display={'flex'} gap={1} justifyContent={'right'}>
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
