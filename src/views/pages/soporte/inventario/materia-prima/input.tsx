import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import moment from 'moment'

import { useMutation } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import { mockMaterial, mockProviders, mockUnitWeight } from '@/utils/mocks'
import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'
import CustomDatePicker from '@/@core/components/react-datepicker'
import { postKardexInput } from '@/api/feedstock'
import { inputKardexSchema } from '@/utils/schemas/inventory/input'

const Input = () => {
  const ability = useAbility()

  const canReadEntradas = ability.can('create', 'Materia prima', 'Entradas')

  const methods = useForm({
    defaultValues: {
      material: {
        value: '',
        label: ''
      },
      provider: {
        value: '',
        label: ''
      },
      quantity: undefined,
      unit: {
        value: '',
        label: ''
      },
      charge: undefined,
      expirationDate1: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(inputKardexSchema)
  })

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset
  } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de materia prima registrada con éxito')
      reset()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al registrar la entrada de materia prima')
    }
  })

  const onSubmit = (values: any) => {
    const req = {
      idMaterial: values.material.value,
      idProvider: values.provider.value,
      quantity: Number(values.quantity),
      unit: values.unit.value,
      charge: Number(values.charge),
      expirationDate1: moment(values.expirationDate1).format('YYYY-MM-DD')
    }

    mutate(req)
  }

  return (
    <div>
      <DatePickerWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Controller
                name='material'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={mockMaterial}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Material'
                        placeholder='Seleccione un material'
                        error={!!errors.material?.value}
                        helperText={errors.material?.value?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name='provider'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={mockProviders}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Proveedor'
                        placeholder='Seleccione un proveedor'
                        error={!!errors.provider?.value}
                        helperText={errors.provider?.value?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <CustomTextField
                {...register('quantity')}
                fullWidth
                label='Cantidad'
                placeholder='Ingrese la cantidad'
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CustomTextField
                {...register('charge')}
                fullWidth
                label='Número de lote / carga'
                placeholder='Ingrese el número de lote / carga'
                error={!!errors.charge}
                helperText={errors.charge?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <CustomDatePicker
                control={control}
                errors={errors.expirationDate1}
                minDate={moment().add(1, 'day').toDate()}
              />
            </Grid>

            <Grid item xs={12} md={12} className='flex justify-center'>
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
