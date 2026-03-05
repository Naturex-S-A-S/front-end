import { Fragment, useEffect } from 'react'

import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'

import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Icon } from '@iconify/react'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomButton from '@/@core/components/mui/Button'
import useGetFeedstockList from '@/hooks/feedstock/useGetFeedstockList'
import useGetProductList from '@/hooks/product/useGetProductList'

type Props = {
  isPending: boolean
  isNewVersion?: boolean
}

const Form: React.FC<Props> = ({ isPending, isNewVersion = false }) => {
  const { productList } = useGetProductList()
  const { feedstockList } = useGetFeedstockList()

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details'
  })

  const handleAddDetail = () => {
    append({ idMaterial: null, quantity: null })
  }

  useEffect(() => {
    if (fields.length === 0) {
      append({ idMaterial: null, quantity: null })
    }
  }, [fields, append])

  return (
    <Grid container spacing={4}>
      {!isNewVersion && (
        <Grid item xs={12} md={6}>
          <CustomTextField
            {...register('name')}
            autoFocus
            fullWidth
            label='Nombre'
            placeholder='Ingrese un nombre para la fórmula'
            error={!!errors.name}
            helperText={errors.name?.message as string}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register('comment')}
          autoFocus
          fullWidth
          label='Comentario'
          placeholder='Ingrese un comentario para la fórmula'
          error={!!errors.comment}
          helperText={errors.comment?.message as string}
        />
      </Grid>

      {!isNewVersion && (
        <Grid item xs={12} md={6}>
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
                  <CustomTextField
                    {...params}
                    label='Producto'
                    placeholder='Seleccione un producto'

                    // error={!!errors.products?.[0]?.id}
                    // helperText={errors.products?.[0]?.id?.message}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12} className='flex justify-center'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Material</TableCell>
              <TableCell align='center'>Cantidad</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Controller
                    {...register(`details.${index}.material`)}
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
                            label=''
                            placeholder='Seleccione un material'

                            // error={!!errors.products?.[0]?.id}
                            // helperText={errors.products?.[0]?.id?.message}
                          />
                        )}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align='center'>
                  <CustomTextField
                    {...register(`details.${index}.quantity`)}
                    placeholder='Ingrese una cantidad'
                    error={!!errors.details?.[index]?.quantity}
                    helperText={errors.details?.[index]?.quantity?.message as string}
                    type='number'
                    className='w-40'
                  />
                </TableCell>
                <TableCell>
                  <div className='flex justify-center gap-2'>
                    {/*<Button variant='outlined' color='success' onClick={() => remove(index)}>
                      <Icon icon='mdi:content-save' />
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => remove(index)}>
                      <Icon icon='mdi:cancel' />
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => remove(index)}>
                      <Icon icon='mdi:pen' />
                    </Button>*/}

                    {index !== 0 && (
                      <>
                        {index === fields.length - 1 ? (
                          <Button variant='outlined' color='success' onClick={() => handleAddDetail()}>
                            <Icon icon='mdi:plus' />
                          </Button>
                        ) : (
                          <Button variant='outlined' color='error' onClick={() => remove(index)}>
                            <Icon icon='mdi:trash-can' />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>

      {isNewVersion && (
        <Grid item xs={12} md={6}>
          <FormControlLabel control={<Checkbox {...register('active')} />} label='Activar esta versión' />
        </Grid>
      )}

      <Grid item xs={12}>
        {errors.details && Array.isArray(errors.details) && (
          <FormHelperText error>{errors.details.map((detail: any) => detail?.message)}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  )
}

export default Form
