import { Grid } from '@mui/material'

import { Controller, FormProvider, useForm } from 'react-hook-form'

import CustomButton from '@/@core/components/mui/Button'
import CustomCard from '@/@core/components/mui/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import type { IProduct } from '@/types/pages/product'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import useGetProductUnit from '@/hooks/product/useGetProductUnit'

interface IProps {
  product: IProduct
}

const Detail: React.FC<IProps> = ({ product }) => {
  const { units } = useGetProductUnit()

  console.log(units)

  const methods = useForm({
    defaultValues: {
      name: product.name,
      measurement: product.measurement,
      unit: null,
      minimumStandard: product.minimumStandard
    }
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
    control
  } = methods

  const onSubmit = (values: any) => {
    console.log(values)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={12}>
        <CustomCard title='Información'>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('name')}
                    fullWidth
                    label='Nombre'
                    placeholder='Ingrese el nombre'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('measurement')}
                    fullWidth
                    label='Medición'
                    placeholder='Ingrese la medición'
                    error={!!errors.measurement}
                    helperText={errors.measurement?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name='unit'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={[
                          {
                            label: 'ml',
                            value: 'ml'
                          }
                        ]}
                        onChange={(e, value: any) => {
                          onChange(value)
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Unidad'
                            placeholder='Seleccione una unidad'
                            error={!!errors.unit}

                            // helperText={errors.unit?.value?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('minimumStandard')}
                    fullWidth
                    type='number'
                    label='Stock mínimo'
                    placeholder=''
                  />
                </Grid>

                <Grid item xs={12} className='flex justify-center'>
                  <CustomButton text='Actualizar' type='submit' isLoading={false} />
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </CustomCard>
      </Grid>
    </Grid>
  )
}

export default Detail
