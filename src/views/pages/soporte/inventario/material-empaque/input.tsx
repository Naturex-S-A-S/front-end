import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'
import { kardexPackagingInputSchema } from '@/utils/schemas/inventory/input'
import useKardexInput from '@/hooks/packaging/kardex/useKardexInput'
import { ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import useGetPackagingList from '@/hooks/packaging/useGetPackagingList'
import useGetProvidersList from '@/hooks/provider/useGetProvidersList'

const Input = () => {
  const { mutateAsync, isPending } = useKardexInput()
  const { packagingList } = useGetPackagingList()
  const { providersList } = useGetProvidersList()
  const ability = useAbility()

  const canReadEntradas = ability.can('create', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.ENTRADAS)
  const canReadListado = ability.can('read', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.LISTADO)

  const methods = useForm({
    defaultValues: {
      material: undefined,
      provider: undefined,
      quantity: undefined,
      charge: undefined,
      document: undefined,
      batch: undefined,
      location: undefined,
      rack: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(kardexPackagingInputSchema)
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
      idMaterial: values.material.id,
      idProvider: values.provider.id,
      quantity: Number(values.quantity),
      charge: Number(values.charge),
      document: values.document,
      batch: values.batch,
      location: values.location,
      rack: values.rack
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
                    options={packagingList || []}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Material de empaque'
                        placeholder='Seleccione un material de empaque'
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

            <Grid item xs={12} className='flex justify-center'>
              {!canReadListado && (
                <div className='mt-4 text-red-500'>No tienes permisos para ver el listado de material de empaque.</div>
              )}

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
                <div className='mt-4 text-red-500'>
                  No tienes permisos para registrar movimientos de material de empaque.
                </div>
              )}
            </Grid>
          </Grid>
        </form>
      </DatePickerWrapper>
    </div>
  )
}

export default Input
