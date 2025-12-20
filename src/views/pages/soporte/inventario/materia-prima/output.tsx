import { Controller, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import { Icon } from '@iconify/react'

import CustomButton from '@/@core/components/mui/Button'
import { useAbility } from '@/hooks/casl/useAbility'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'

const Output = () => {
  const ability = useAbility()

  const canReadEntradas = ability.can('create', 'Materia prima', 'Entradas')
  const canReadSalidas = ability.can('create', 'Materia prima', 'Control de salidas')

  const methods = useForm({
    defaultValues: {
      product: {
        value: ''
      },
      quantity: ''
    }
  })

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors }
  } = methods

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Controller
              name='product'
              control={control}
              render={() => (
                <CustomAutocomplete
                  {...register('product')}
                  options={[
                    {
                      label: 'Materia Prima 1',
                      value: '1'
                    },
                    {
                      label: 'Materia Prima 2',
                      value: '2'
                    }
                  ]}
                  onChange={(e, value: any) => {
                    if (!value) return

                    setValue('product', {
                      value: value.value
                    })
                  }}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Producto'
                      placeholder='Seleccione un producto'
                      error={!!errors.product}
                      helperText={errors.product?.value?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register('quantity')}
              autoFocus
              fullWidth
              label='Cantidad'
              placeholder='Ingrese la cantidad'
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
            />
          </Grid>
          <Grid item xs={12} md={12} className='flex justify-center'>
            {canReadEntradas || canReadSalidas ? (
              <div className='mt-4'>
                {canReadEntradas && (
                  <CustomButton
                    startIcon={<Icon icon='ic:baseline-plus' width='24' height='24' />}
                    className='mr-2 px-4 py-2 text-white rounded d-flex align-middle'
                    isLoading={false}
                  >
                    Registrar Entrada
                  </CustomButton>
                )}
                {canReadSalidas && (
                  <CustomButton
                    startIcon={<Icon icon='ic:baseline-minus' width='24' height='24' />}
                    className='px-4 py-2 bg-red-500 text-white rounded d-flex align-middle'
                    isLoading={false}
                  >
                    Registrar Salida
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
