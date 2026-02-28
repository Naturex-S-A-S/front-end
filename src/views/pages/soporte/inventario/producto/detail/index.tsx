import { useEffect } from 'react'

import { Grid } from '@mui/material'

import { Controller, FormProvider, useForm } from 'react-hook-form'

import CustomButton from '@/@core/components/mui/Button'
import CustomCard from '@/@core/components/mui/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import type { IProduct } from '@/types/pages/product'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import useGetProductUnit from '@/hooks/product/useGetProductUnit'
import usePutProduct from '@/hooks/product/usePatchProduct'
import History from './history'
import FormulationsList from './formulationsList'
import { useAbility } from '@/hooks/casl/useAbility'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'

interface IProps {
  product: IProduct
}

const Detail: React.FC<IProps> = ({ product }) => {
  const { units } = useGetProductUnit()
  const { mutate, isPending } = usePutProduct()
  const ability = useAbility()

  const canReadFormulation = ability.can(
    ABILITY_ACTIONS.READ as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.FORMULATION
  )

  const methods = useForm({
    defaultValues: {
      name: '',
      measurement: '',
      unit: null,
      minimumStandard: ''
    },
    mode: 'onChange'
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    reset
  } = methods

  useEffect(() => {
    if (!product || !units?.length) return

    reset({
      name: product.name ?? '',
      measurement: product.measurement?.toString() ?? '',
      unit: units.find((u: any) => u.id === product.unit) ?? null,
      minimumStandard: product.minimumStandard?.toString() ?? ''
    })
  }, [product, units, reset])

  const onSubmit = (values: any) => {
    mutate({
      id: product.id,
      data: {
        name: values.name,
        measurement: Number(values.measurement),
        unit: values.unit.id,
        minimumStandard: Number(values.minimumStandard)
      }
    })
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
                <Grid item xs={12} md={3} lg={3}>
                  <CustomTextField
                    {...register('measurement')}
                    fullWidth
                    label='Medida'
                    placeholder='Ingrese la medida'
                    error={!!errors.measurement}
                    helperText={errors.measurement?.message}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Controller
                    name='unit'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={units ?? []}
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
                <Grid item xs={12} md={3} lg={3}>
                  <CustomTextField
                    {...register('minimumStandard')}
                    fullWidth
                    type='number'
                    label='Stock mínimo'
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
      <Grid item xs={12}>
        <CustomCard title='Historial'>
          <History list={product.productHistory ?? []} />
        </CustomCard>
      </Grid>
      {canReadFormulation && (
        <Grid item xs={12}>
          <CustomCard title='Formulas'>
            <FormulationsList productId={product.id} />
          </CustomCard>
        </Grid>
      )}
    </Grid>
  )
}

export default Detail
