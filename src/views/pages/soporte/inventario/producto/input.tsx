import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { yupResolver } from '@hookform/resolvers/yup'

import moment from 'moment'

import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'
import useKardexInput from '@/hooks/product/kardex/useKardexInput'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import useGetProductList from '@/hooks/product/useGetProductList'
import CustomDatePicker from '@/@core/components/react-datepicker'
import { kardexProductInputSchema } from '@/utils/schemas/inventory/input'

const Input = () => {
  const { mutateAsync, isPending } = useKardexInput()
  const { productList } = useGetProductList()
  const ability = useAbility()

  const canReadEntradas = ability.can(ABILITY_ACTIONS.READ as any, ABILITY_SUBJECT.PRODUCT, ABILITY_FIELDS.ENTRADAS)

  const methods = useForm({
    defaultValues: {
      product: undefined,
      order: undefined,
      quantity: undefined,
      batch: undefined,
      rack: undefined,
      location: undefined,
      expirationDate1: undefined,
      observation: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(kardexProductInputSchema)
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
      rack: values.rack,
      location: values.location,
      quantity: Number(values.quantity),
      expirationDate1: moment(values.expirationDate1).format('YYYY-MM-DD'),
      idOrder: values.order
    }

    mutateAsync(req).then(() => {
      reset()
    })
  }

  return (
    <div>
      <DatePickerWrapper>
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
            <Grid item xs={12} md={6} lg={2}>
              <CustomTextField
                {...register('location')}
                fullWidth
                label='Ubicación'
                placeholder='Ingrese la ubicación'
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <CustomTextField
                {...register('rack')}
                fullWidth
                label='Rack'
                placeholder='Ingrese el Rack'
                error={!!errors.rack}
                helperText={errors.rack?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <CustomDatePicker
                control={control}
                errors={errors.expirationDate1}
                minDate={moment().add(1, 'day').toDate()}
                name='expirationDate1'
                label='Fecha de vencimiento 1'
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
              {canReadEntradas ? (
                <div className='mt-4'>
                  {canReadEntradas && (
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
                <div className='mt-4 text-red-500'>No tienes permisos para registrar movimientos de entrada.</div>
              )}
            </Grid>
          </Grid>
        </form>
      </DatePickerWrapper>
    </div>
  )
}

export default Input
