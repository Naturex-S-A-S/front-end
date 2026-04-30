import { memo, useDeferredValue, useMemo } from 'react'

import { useForm, Controller } from 'react-hook-form'

import { Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import useGetProductList from '@/hooks/product/useGetProductList'

type Filters = {
  product?: {
    id: number
  }
  status?: string
}

type Props = {
  defaultValues?: Filters
  onApplyFilters?: (filters: any) => void
}

const Filter = memo(({ defaultValues, onApplyFilters }: Props) => {
  const { control, handleSubmit, reset } = useForm<Filters>({ defaultValues })

  const { productList } = useGetProductList()

  const submit = (data: Filters) => {
    onApplyFilters?.({
      productId: data?.product?.id || undefined,
      status: data.status || undefined
    })
  }

  const clear = () => {
    reset(defaultValues)
    onApplyFilters?.(defaultValues)
  }

  const productListDeferred = useDeferredValue(productList)

  const getOptionLabel = useMemo(() => (option: any) => option?.fullName || '', [])

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems='end'>
          <Grid item xs={12} md={4}>
            <Controller
              name='product'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={productListDeferred}
                  getOptionLabel={getOptionLabel}
                  onChange={(_, v: any | null) => onChange(v)}
                  renderInput={(params: any) => (
                    <CustomTextField {...params} label='Elegir producto' placeholder='Seleccione un producto' />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={8} display='flex' gap={1} justifyContent='flex-end'>
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
})

Filter.displayName = 'Filter'

export default Filter
