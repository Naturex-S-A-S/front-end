import { Controller, FormProvider, useForm } from 'react-hook-form'

import { Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import type { IPackaging } from '@/hooks/packaging/useGetPackagingById'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { mockUnitWeight } from '@/utils/mocks'
import usePatchPackaging from '@/hooks/packaging/usePatchPackaging'
import Categories from '../../../../../../@core/components/inventory/categories'
import Providers from '../../../../../../@core/components/inventory/providers'
import useGetCategory from '@/hooks/packaging/useGetCategory'

interface Props {
  packaging: IPackaging
}

const Detail: React.FC<Props> = ({ packaging }) => {
  const { mutate, isPending } = usePatchPackaging()
  const { categories } = useGetCategory()

  const methods = useForm({
    defaultValues: {
      name: packaging.name,
      color: packaging.color,
      measureUnit: {
        label: 'Gramo',
        value: 'g'
      },
      quantity: packaging.quantityG,
      charge: packaging.chargeG,
      total: packaging.charge,
      minimumStandard: packaging.minimumStandard
    }
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
    control
  } = methods

  const onSubmit = (values: any) => {
    const req = {
      name: values.name,
      color: values.color
    }

    mutate({
      id: packaging.id,
      data: req
    })
  }

  const updateCategories = (newCategories: string[]) => {
    mutate({
      id: packaging.id,
      data: {
        category: newCategories
      }
    })
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
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
                    {...register('color')}
                    fullWidth
                    label='Color'
                    placeholder='Ingrese el color'
                    error={!!errors.color}
                    helperText={errors.color?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('minimumStandard')}
                    disabled
                    fullWidth
                    type='number'
                    label='Stock mínimo'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Controller
                    name='measureUnit'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
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
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('quantity')}
                    disabled
                    fullWidth
                    type='number'
                    label='Cantidad'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('charge')}
                    disabled
                    fullWidth
                    type='number'
                    label='Valor unitario'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register('total')}
                    disabled
                    fullWidth
                    type='number'
                    label='Total'
                    placeholder=''
                  />
                </Grid>

                <Grid item xs={12} className='flex justify-center'>
                  <CustomButton text='Actualizar' type='submit' isLoading={isPending} />
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </CustomCard>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={12}>
            <Categories data={packaging.categories} list={categories} update={updateCategories} isPending={isPending} />
          </Grid>

          <Grid item xs={12} md={6} lg={12}>
            <Providers data={packaging.providers} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Detail
