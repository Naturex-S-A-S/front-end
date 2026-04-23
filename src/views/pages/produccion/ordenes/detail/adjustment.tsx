import type { FC } from 'react'
import { useState } from 'react'

import { Box, Card, CardContent, CardHeader, Grid, MenuItem } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import type { IOrderDetail, IOrderItem } from '@/types/pages/order'
import CreateButton from '@/components/layout/shared/CreateButton'
import CustomDialog from '@/@core/components/mui/Dialog'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import { adjustmentMaterialSchema, adjustmentProductSchema, categoryOnlySchema } from '@/utils/schemas/order'
import AdjustmentList from './adjustmentList'

type Option = { id: number; label: string }

interface AdjustmentFormValues {
  category?: Option | null
  material?: Option | null
  product?: Option | null
  type?: string | null
  charge?: string | null
  quantity?: number | null
  observation?: string | null
  location?: string | null
  classification?: string | null
  batch?: string | null
  rack?: string | null
  expiration_date_1?: string | null
  expiration_date_2?: string | null
}

interface IProps {
  materials: IOrderDetail[]
  products: IOrderItem[]
  orderId: number
}

const Adjustment: FC<IProps> = ({ materials, products, orderId }) => {
  const [open, setOpen] = useState(false)

  const { control, handleSubmit, watch, reset, setValue } = useForm<AdjustmentFormValues>({
    defaultValues: {
      category: undefined,
      material: null,
      product: null,
      type: null,
      charge: '',
      quantity: null,
      observation: '',
      location: '',
      classification: '',
      batch: '',
      rack: '',
      expiration_date_1: '',
      expiration_date_2: ''
    },
    resolver: async (data, context, options) => {
      const catId = data.category?.id

      const schema = catId === 1 ? adjustmentMaterialSchema : catId === 2 ? adjustmentProductSchema : categoryOnlySchema

      return yupResolver(schema)(data as any, context, options as any)
    }
  })

  const toogleDialog = () => {
    setOpen(!open)
  }

  const categoryWatch: any = watch('category')

  const isCategoryProduct = categoryWatch?.id === 2
  const isCategoryMaterial = categoryWatch?.id === 1

  const materialOptions = materials.map((material: any) => ({
    id: material.id,
    label: material.nameMaterial
  }))

  const productOptions = products.map((product: any) => ({
    id: product.finalProduct.id,
    label: product.finalProduct.name
  }))

  const handleOnSubmit = (values: any) => {
    console.log({ values, orderId })
  }

  const handleOnChangeCategory = (_: any, value: any) => {
    setValue('category', value)
    reset({
      category: value,
      material: null,
      product: null,
      type: null,
      charge: '',
      quantity: null,
      observation: '',
      location: '',
      classification: '',
      batch: '',
      rack: '',
      expiration_date_1: '',
      expiration_date_2: ''
    })
  }

  return (
    <Card>
      <CardHeader title='Ajustes' />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CreateButton onClick={toogleDialog} />
        </Box>
        <CustomDialog open={open} toogleDialog={toogleDialog} title='Realizar Ajuste'>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name='category'
                  control={control}
                  rules={{ required: 'Seleccione una categoría' }}
                  render={({ field: { value }, fieldState: { error } }: any) => (
                    <CustomAutocomplete
                      value={value}
                      options={[
                        {
                          id: 1,
                          label: 'Material de empaque / Materia prima'
                        },
                        {
                          id: 2,
                          label: 'Producto'
                        }
                      ]}
                      onChange={handleOnChangeCategory}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Categoria'
                          placeholder='Seleccione una categoria'
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {isCategoryMaterial && (
                <>
                  <Grid item xs={6}>
                    <Controller
                      name='material'
                      control={control}
                      rules={{ required: 'Seleccione un material' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomAutocomplete
                          value={value}
                          options={materialOptions}
                          onChange={(e, v: any) => onChange(v)}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Material'
                              placeholder='Seleccione material'
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='type' // entrada o salida
                      control={control}
                      rules={{ required: 'Seleccione entrada o salida' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          select
                          label='Tipo'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          error={!!error}
                          helperText={error?.message}
                        >
                          <MenuItem value='IN'>Entrada</MenuItem>
                          <MenuItem value='OUT'>Salida</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='charge' // entrada o salida
                      control={control}
                      rules={{ required: 'Seleccione entrada o salida' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          label='Cargo'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='quantity'
                      control={control}
                      rules={{ required: 'Ingrese la cantidad', min: { value: 1, message: 'Cantidad mínima 1' } }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          type='number'
                          label='Cantidad'
                          value={value ?? ''}
                          onChange={e => onChange(Number(e.target.value))}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name='observation'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField
                          label='Observación'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          multiline
                          rows={3}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {isCategoryProduct && (
                <>
                  <Grid item xs={12}>
                    <Controller
                      name='product'
                      control={control}
                      rules={{ required: 'Seleccione un producto' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomAutocomplete
                          value={value}
                          options={productOptions}
                          onChange={(e, v: any) => onChange(v)}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Producto'
                              placeholder='Seleccione producto'
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='type'
                      control={control}
                      rules={{ required: 'El tipo es requerido' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          label='Tipo'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='classification'
                      control={control}
                      rules={{ required: 'Ingrese una clasificación' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          label='Clasificación'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='batch'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField label='Lote' value={value ?? ''} onChange={e => onChange(e.target.value)} />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='rack'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField label='Rack' value={value ?? ''} onChange={e => onChange(e.target.value)} />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='location'
                      control={control}
                      rules={{ required: 'Debe ingresar el lugar de almacenamiento' }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          label='Ubicación'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='quantity'
                      control={control}
                      rules={{ required: 'Debe ingresar la cantidad', min: { value: 1, message: 'Cantidad mínima 1' } }}
                      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
                        <CustomTextField
                          type='number'
                          label='Cantidad'
                          value={value ?? ''}
                          onChange={e => onChange(Number(e.target.value))}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='expiration_date_1'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField
                          type='date'
                          label='Fecha expiración 1'
                          InputLabelProps={{ shrink: true }}
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name='expiration_date_2'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField
                          type='date'
                          label='Fecha expiración 2'
                          InputLabelProps={{ shrink: true }}
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name='observation'
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <CustomTextField
                          label='Observación'
                          value={value ?? ''}
                          onChange={e => onChange(e.target.value)}
                          multiline
                          rows={3}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <CustomButton type='submit'>Guardar</CustomButton>
              </Grid>
            </Grid>
          </form>
        </CustomDialog>
        <AdjustmentList />
      </CardContent>
    </Card>
  )
}

export default Adjustment
