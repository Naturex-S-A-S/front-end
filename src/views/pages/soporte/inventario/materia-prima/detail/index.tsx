import { Controller, FormProvider, useForm } from 'react-hook-form'

import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { mockUnitWeight } from '@/utils/mocks'
import usePatchFeedstock from '@/hooks/feedstock/usePatchFeedstock'
import type { IFeedstock } from '@/hooks/feedstock/useGetFeedstockById'

interface Props {
  feedstock: IFeedstock
}

const Detail: React.FC<Props> = ({ feedstock }) => {
  const { mutate, isPending } = usePatchFeedstock()

  const methods = useForm({
    defaultValues: {
      name: feedstock.name,
      allergen: feedstock.allergen,
      measureUnit: {
        label: 'Gramo',
        value: 'g'
      },
      quantity: feedstock.quantityG,
      charge: feedstock.chargeG,
      total: feedstock.charge,
      minimumStandard: feedstock.minimumStandard,
      category:
        Array.isArray(feedstock.categories) && feedstock.categories.length > 0 ? feedstock.categories[0] : undefined,
      provider:
        Array.isArray(feedstock.providers) && feedstock.providers.length > 0 ? feedstock.providers[0] : undefined
    }
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
    control
  } = methods

  const onSubmit = (data: any) => {
    const req = {
      name: data.name,
      allergen: data.allergen
    }

    mutate({
      id: feedstock.id,
      data: req
    })
  }

  return (
    <CustomCard title='Información'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <CustomTextField
                {...register('name')}
                autoFocus
                fullWidth
                label='Nombre'
                placeholder='Ingrese el nombre'
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <CustomTextField
                {...register('minimumStandard')}
                disabled
                autoFocus
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
                autoFocus
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
                autoFocus
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
                autoFocus
                fullWidth
                type='number'
                label='Total'
                placeholder=''
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Controller
                name='allergen'
                control={control}
                render={({ field: { value } }: any) => (
                  <FormControlLabel control={<Checkbox {...register('allergen')} checked={value} />} label='Alérgeno' />
                )}
              />
            </Grid>

            <Grid item xs={12} className='flex justify-center'>
              <CustomButton text='Actualizar' type='submit' isLoading={isPending} />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomCard>
  )
}

export default Detail
