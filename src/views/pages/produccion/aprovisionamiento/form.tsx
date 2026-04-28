import { useCallback, useEffect, useRef, useState } from 'react'

import type { Theme } from '@mui/material'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  Alert
} from '@mui/material'

import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import classNames from 'classnames'

import moment from 'moment'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomButton from '@/@core/components/mui/Button'
import useGetProductList from '@/hooks/product/useGetProductList'
import CustomDatePicker from '@/@core/components/react-datepicker'

type Props = {
  isPending: boolean
  isChanged: boolean
  setIsChanged: (value: boolean) => void
  orderCalculate: () => void
  isPendingOrderCalculate: boolean
}

type Product = {
  id: string | number
  fullName?: string
  [k: string]: any
}

type Presentation = {
  id: string
  fullName?: string
  quantityG?: number | string
  [k: string]: any
}

const LoaderInfo = () => (
  <>
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: '8px' }} />
  </>
)

const Form: React.FC<Props> = ({
  isPending: isPendingCreate,
  isChanged,
  setIsChanged,
  orderCalculate,
  isPendingOrderCalculate
}) => {
  const [step, setStep] = useState<number>(0)

  const { productList } = useGetProductList()

  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const {
    register,
    formState: { errors },
    control,
    reset,
    trigger,
    setValue,
    getValues
  }: any = useFormContext()

  const { fields, replace } = useFieldArray({
    control,
    name: 'presentations'
  })

  const productsWatch = useWatch({ control, name: 'products' })
  const calculatedData = useWatch({ control, name: 'calculatedData' })

  const prevProductsRef = useRef<string>('')

  useEffect(() => {
    const serialized = JSON.stringify(productsWatch?.map((p: Product) => p.id) ?? [])

    if (serialized === prevProductsRef.current) return
    prevProductsRef.current = serialized

    if (productsWatch?.length > 0) {
      replace(productsWatch.map((product: Product) => ({ ...product, quantityG: '' })))
      setStep(1)
    } else {
      setStep(0)
      reset()
      replace([])
    }
  }, [productsWatch, replace, reset])

  const handleContinue = useCallback(async () => {
    const result = await trigger('presentations')

    if (result) {
      setStep(2)
      orderCalculate()
    }
  }, [orderCalculate, setStep, trigger])

  const handleChangeQuantity = (newValue: string, index: number) => {
    const oldValue = getValues(`presentations.${index}.quantityG`)

    if (newValue !== oldValue) setIsChanged(true)
  }

  const getCardClass = useCallback(() => {
    return classNames({
      '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': isBelowMdScreen && !isBelowSmScreen,
      '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
    })
  }, [isBelowMdScreen, isBelowSmScreen])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display='flex' flexDirection='column' gap={4}>
                  <Controller
                    name='products'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        multiple
                        options={productList}
                        getOptionLabel={(option: any) => option?.completeName || option?.name || ''}
                        onChange={(e, value: any) => {
                          onChange(value)
                        }}
                        renderInput={params => (
                          <CustomTextField {...params} label='Producto' placeholder='Seleccione un producto' />
                        )}
                      />
                    )}
                  />

                  <Divider />

                  {isPendingOrderCalculate ? (
                    <LoaderInfo />
                  ) : (
                    (step === 1 || step === 2) && (
                      <>
                        <Typography variant='h5'>Presentaciones</Typography>
                        {fields.map((presentation: Presentation, index: number) => (
                          <CustomTextField
                            {...register(`presentations.${index}.quantityG`)}
                            type='number'
                            autoComplete='off'
                            onBlur={e => {
                              handleChangeQuantity(e.target.value, index)
                            }}
                            onChange={e => {
                              const value = e.target.value

                              handleChangeQuantity(value, index)

                              setValue(`presentations.${index}.quantityG`, value)
                            }}
                            key={presentation.id}
                            fullWidth
                            label={`${presentation.fullName}`}
                            placeholder='Ingrese las unidades a producir'
                            error={!!errors?.presentations?.[index]?.quantityG}
                          />
                        ))}

                        {(step === 1 || isChanged) && <CustomButton text='Calcular' onClick={handleContinue} />}

                        {step === 2 && (
                          <>
                            <Divider />
                            <CustomTextField
                              {...register('batch')}
                              fullWidth
                              label='Lote'
                              placeholder='Ej: 11997'
                              error={!!errors.batch}
                              helperText={errors.batch?.message}
                            />
                            <CustomDatePicker
                              control={control}
                              minDate={moment().add(1, 'day').toDate()}
                              name='expirationDate1'
                              label='Fecha de vencimiento'
                              errors={errors?.expirationDate1?.message}
                            />
                            <CustomButton
                              text='Generar aprovisionamiento'
                              type='submit'
                              disabled={isChanged}
                              isLoading={isPendingCreate}
                            />
                          </>
                        )}
                      </>
                    )
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        {isPendingOrderCalculate ? (
          <>
            <Skeleton variant='rectangular' width='100%' height={90} sx={{ borderRadius: '8px', marginBottom: 4 }} />
            <Skeleton variant='rectangular' width='100%' height={200} sx={{ borderRadius: '8px', marginBottom: 4 }} />
            <Skeleton variant='rectangular' width='100%' height={200} sx={{ borderRadius: '8px' }} />
          </>
        ) : (
          <Grid container spacing={4}>
            {calculatedData?.message && step === 2 && (
              <Grid item xs={12}>
                <Alert severity={calculatedData?.totalQuantityMissing === 0 ? 'success' : 'warning'}>
                  {calculatedData.message}
                </Alert>
              </Grid>
            )}

            {step === 2 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Grid container spacing={6}>
                      <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                        <div className='flex h-full'>
                          <div className='flex flex-col justify-between'>
                            <Typography variant='caption'>Cantidad a producir (Kg)</Typography>
                            <Typography variant='h5'>{calculatedData?.totalQuantityInKg}</Typography>
                          </div>
                        </div>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                        <div className='flex h-full'>
                          <div className='flex flex-col justify-between'>
                            <Typography variant='caption'>Total general</Typography>
                            <Typography variant='h5'>
                              {calculatedData?.materials?.reduce((a: number, b: any) => a + b.quantityTotalOrder, 0)}
                            </Typography>
                          </div>
                        </div>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                        <div className='flex h-full'>
                          <div className='flex flex-col justify-between'>
                            <Typography variant='caption'>Total costo</Typography>
                            <Typography variant='h5'>~ {calculatedData?.totalChargeMaterialByOrder}</Typography>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Codigo</TableCell>
                        <TableCell>Descripcion</TableCell>
                        <TableCell>Cantidad disponible</TableCell>
                        <TableCell>Cantidad faltante</TableCell>
                        <TableCell>Cantidad Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {step !== 2 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                            Ingrese las cantidades de las presentaciones
                          </TableCell>
                        </TableRow>
                      ) : (
                        calculatedData?.materials.map((item: any, index: number) => (
                          <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantityAvailable}</TableCell>
                            <TableCell>{item.quantityMissing}</TableCell>
                            <TableCell>{item.quantityTotalOrder}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/*step === 2 && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title='Ajustes' />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button variant='contained' color='success'>
                        <Icon icon='tabler:plus' />
                      </Button>
                      <Button variant='contained' color='warning'>
                        <Icon icon='tabler:minus' />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )*/}
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default Form
