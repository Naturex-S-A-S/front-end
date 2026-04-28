'use client'

import { useEffect, useRef } from 'react'

import { Box, Grid, IconButton, Typography } from '@mui/material'
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { Icon } from '@iconify/react'

import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { getFileTypes } from '@/api/metadata'
import { postSaleOrderType1, postSaleOrderType2 } from '@/api/order'

type FormValues = {
  fileType: {
    id: string
  }
  file: File | null
}

const Form = () => {
  const { data: fileTypes } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: getFileTypes
  })

  const {
    register,
    control,
    formState: { errors }
  }: any = useFormContext()

  const fileWatch = useWatch({
    control,
    name: 'file'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!fileWatch && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [fileWatch])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Controller
          {...register(`fileType`)}
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={fileTypes || []}
              onChange={(e, value: any) => {
                onChange(value)
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Tipo de archivo'
                  placeholder='Seleccione el tipo de archivo'
                  error={!!errors.fileType}
                  helperText={errors.fileType?.message as string}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name='file'
          control={control}
          render={({ field: { value, onChange } }) => (
            <Box>
              <Typography
                component='label'
                sx={{
                  display: 'block',
                  lineHeight: 1.153,
                  fontSize: 'var(--mui-typography-body2-fontSize, 0.8125rem)',
                  mb: 1,
                  color: errors.file ? 'var(--mui-palette-error-main)' : 'var(--mui-palette-text-primary)'
                }}
              >
                Archivo Excel
              </Typography>

              {value ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid var(--mui-palette-customColors-inputBorder)',
                    borderRadius: 'var(--mui-shape-borderRadius)',
                    padding: '5.25px 14px',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Icon icon='mdi:microsoft-excel' style={{ color: '#28C76F', fontSize: '1rem', flexShrink: 0 }} />
                  <Typography
                    variant='body2'
                    sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {value.name}
                  </Typography>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => {
                      onChange(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <Icon icon='mdi:close-circle' style={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    border: '1px dashed var(--mui-palette-customColors-inputBorder)',
                    borderRadius: 'var(--mui-shape-borderRadius)',
                    padding: '7.25px 14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: 'var(--mui-palette-action-active)'
                    }
                  }}
                >
                  <Icon
                    icon='mdi:file-excel-outline'
                    style={{ color: '#28C76F', fontSize: '1.25rem', flexShrink: 0 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Haz clic para seleccionar un archivo Excel
                  </Typography>
                </Box>
              )}

              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls,.csv'
                hidden
                onChange={e => {
                  const file = e.target.files?.[0]

                  if (file) onChange(file)
                }}
              />

              {errors.file && (
                <Typography
                  variant='caption'
                  color='error'
                  sx={{
                    mt: 1,
                    lineHeight: 1.154,
                    fontSize: 'var(--mui-typography-body2-fontSize, 0.8125rem)',
                    display: 'block'
                  }}
                >
                  {errors.file.message as string}
                </Typography>
              )}
            </Box>
          )}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' />
      </Grid>
    </Grid>
  )
}

const SALE_ORDER_TYPE_1 = 'remision_venta'
const SALE_ORDER_TYPE_2 = 'ventas_siigo'

const Testing = () => {
  const methods = useForm<FormValues>({
    defaultValues: { fileType: undefined, file: null }
  })

  const { mutate } = useMutation({
    mutationFn: (data: FormValues) => {
      const formData = new FormData()

      formData.append('file', data.file as Blob)

      if (data.fileType.id === SALE_ORDER_TYPE_1) {
        return postSaleOrderType1(formData)
      } else if (data.fileType.id === SALE_ORDER_TYPE_2) {
        return postSaleOrderType2(formData)
      }

      return Promise.reject(new Error('Tipo de archivo no válido'))
    },
    onSuccess: (result: any) => {
      methods.reset()

      toast.success(result)
    },
    onError: error => {
      toast.error(error.message || 'Error al procesar el archivo')
    }
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <Box sx={{ p: 6 }}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Form />
        </form>
      </FormProvider>
    </Box>
  )
}

export default Testing
