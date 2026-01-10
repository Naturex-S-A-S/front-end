import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { yupResolver } from '@hookform/resolvers/yup'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import { outputKardexSchema } from '@/utils/schemas/inventory/output'
import useFeedstock from '@/hooks/feedstock/useFeedstock'
import { mockUnitWeight } from '@/utils/mocks'
import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import useKardexOutput from '@/hooks/feedstock/kardex/useKardexOutput'

const Output = () => {
  const { mutateAsync, isPending } = useKardexOutput()
  const { feedstock } = useFeedstock()

  const ability = useAbility()

  // const canReadEntradas = ability.can('create', 'Materia prima', 'Entradas')
  const canReadSalidas = ability.can('create', 'Materia prima', 'Control de salidas')

  const methods = useForm({
    defaultValues: {
      material: undefined,
      quantity: undefined,
      unit: undefined,
      batch: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(outputKardexSchema)
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
      quantity: Number(values.quantity),
      unit: values.unit.value
    }

    mutateAsync(req).then(() => {
      reset()
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} lg={4}>
            <Controller
              name='material'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={feedstock || []}
                  onChange={(e, value: any) => {
                    onChange(value)
                  }}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Material'
                      placeholder='Seleccione un material'
                      error={!!errors.material?.id}
                      helperText={errors.material?.id?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <CustomTextField
              {...register('batch')}
              label='Lote'
              placeholder='Ingrese el lote'
              error={!!errors.batch}
              helperText={errors.batch?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={2}>
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

          <Grid item xs={12} sm={6} lg={2}>
            <CustomTextField
              {...register('quantity')}
              fullWidth
              label='Cantidad'
              placeholder='Ingrese la cantidad'
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
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
              <div className='mt-4 text-red-500'>No tienes permisos para registrar movimientos de materia prima.</div>
            )}
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export default Output
