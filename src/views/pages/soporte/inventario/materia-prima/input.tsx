import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import moment from 'moment'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import { mockUnitWeight } from '@/utils/mocks'
import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'
import CustomDatePicker from '@/@core/components/react-datepicker'
import { kardexFeedstockInputSchema } from '@/utils/schemas/inventory/input'
import useKardexInput from '@/hooks/feedstock/kardex/useKardexInput'
import { ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import useGetFeedstockList from '@/hooks/feedstock/useGetFeedstockList'
import useGetProvidersList from '@/hooks/provider/useGetProvidersList'

const Input = () => {
  const { mutateAsync, isPending } = useKardexInput()
  const { providersList } = useGetProvidersList()
  const { feedstockList } = useGetFeedstockList()
  const ability = useAbility()

  const canReadEntradas = ability.can('create', ABILITY_SUBJECT.FEEDSTOCK, ABILITY_FIELDS.ENTRADAS)

  const methods = useForm({
    defaultValues: {
      material: undefined,
      provider: undefined,
      quantity: undefined,
      unit: undefined,
      charge: undefined,
      document: undefined,
      batch: undefined,
      location: undefined,
      rack: undefined,
      expirationDate1: undefined,
      expirationDate2: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(kardexFeedstockInputSchema)
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
      batch: values.batch,
      idMaterial: values.material.id,
      idProvider: values.provider.id,
      quantity: Number(values.quantity),
      unit: values.unit.value,
      charge: Number(values.charge),
      document: values.document,
      location: values.location,
      rack: values.rack,
      expirationDate1: moment(values.expirationDate1).format('YYYY-MM-DD'),
      expirationDate2: moment(values.expirationDate2).format('YYYY-MM-DD')
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
                name='material'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={feedstockList || []}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Materia prima'
                        placeholder='Seleccione una materia prima'
                        error={!!errors.material?.id}
                        helperText={errors.material?.id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name='provider'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={providersList || []}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Proveedor'
                        placeholder='Seleccione un proveedor'
                        error={!!errors.provider?.id}
                        helperText={errors.provider?.id?.message}
                      />
                    )}
                  />
                )}
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
                {...register('document')}
                fullWidth
                label='Documento'
                placeholder='Ingrese el documento'
                error={!!errors.document}
                helperText={errors.document?.message}
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
              <Controller
                name='unit'
                control={control}
                render={({ field: { value, onChange } }) => (
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
                        error={!!errors.unit?.value}
                        helperText={errors.unit?.value?.message}
                      />
                    )}
                  />
                )}
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

            <Grid item xs={12} md={6} lg={4}>
              <CustomTextField
                {...register('charge')}
                fullWidth
                label='Valor total'
                placeholder='Ingrese el valor total'
                error={!!errors.charge}
                helperText={errors.charge?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <CustomDatePicker
                control={control}
                errors={errors.expirationDate1}
                minDate={moment().add(1, 'day').toDate()}
                name='expirationDate1'
                label='Fecha de vencimiento 1'
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <CustomDatePicker
                control={control}
                errors={errors.expirationDate2}
                minDate={moment().add(1, 'day').toDate()}
                name='expirationDate2'
                label='Fecha de vencimiento 2'
              />
            </Grid>

            <Grid item xs={12} md={6} lg={12} className='flex flex-col justify-center text-center'>
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
                <div className='mt-4 text-red-500'>No tienes permisos para registrar movimientos de materia prima.</div>
              )}
            </Grid>
          </Grid>
        </form>
      </DatePickerWrapper>
    </div>
  )
}

export default Input
