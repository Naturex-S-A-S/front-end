import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import { kardexProductOutputSchema } from '@/utils/schemas/inventory/output'
import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import useKardexOutput from '@/hooks/product/kardex/useKardexOutput'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import useGetProductList from '@/hooks/product/useGetProductList'

const Output = () => {
  const { mutateAsync, isPending } = useKardexOutput()
  const { productList } = useGetProductList()

  const ability = useAbility()

  const canReadSalidas = ability.can(ABILITY_ACTIONS.CREATE as any, ABILITY_SUBJECT.PRODUCT, ABILITY_FIELDS.SALIDAS)

  const methods = useForm({
    defaultValues: {
      product: undefined,
      order: undefined,
      quantity: undefined,
      batch: undefined,
      observation: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(kardexProductOutputSchema)
  })

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset
  } = methods

  const onSubmit = (values: any) => {
    const req = {
      idFinalProduct: values.product.id,
      batch: values.batch,
      observation: values.observation,
      quantity: Number(values.quantity),
      idOrder: values.order
    }

    mutateAsync(req).then(() => {
      reset()
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={4}>
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
                    <CustomTextField
                      {...params}
                      label='Producto'
                      placeholder='Seleccione un producto'
                      error={!!errors.product?.id}
                      helperText={errors.product?.id?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={2}>
            <CustomTextField
              {...register('order')}
              fullWidth
              label='Orden'
              placeholder='Ingrese el orden'
              error={!!errors.order}
              helperText={errors.order?.message}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={2}>
            <CustomTextField
              {...register('quantity')}
              fullWidth
              label='Cantidad'
              placeholder='Ingrese la cantidad'
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={2}>
            <CustomTextField
              {...register('batch')}
              fullWidth
              label='Lote'
              placeholder='Ingrese el lote'
              error={!!errors.batch}
              helperText={errors.batch?.message}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CustomTextField
              {...register('observation')}
              fullWidth
              label='Observación'
              placeholder='Ingrese la observación'
              error={!!errors.observation}
              helperText={errors.observation?.message}
            />
          </Grid>

          <Grid item xs={12} className='flex justify-center'>
            {canReadSalidas ? (
              <div className='mt-4'>
                {canReadSalidas && (
                  <CustomButton
                    className='mr-2 px-4 py-2 text-white rounded d-flex align-middle'
                    isLoading={isPending}
                    type='submit'
                  >
                    Registrar
                  </CustomButton>
                )}
              </div>
            ) : (
              <div className='mt-4 text-red-500'>
                No tienes permisos para registrar movimientos de material de empaque.
              </div>
            )}
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export default Output
