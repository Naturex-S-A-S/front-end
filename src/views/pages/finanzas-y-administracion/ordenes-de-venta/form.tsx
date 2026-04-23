import { useEffect, useRef } from 'react'

import { Icon } from '@iconify/react'

import { Box, Grid, IconButton, Typography } from '@mui/material'

import { useQuery } from '@tanstack/react-query'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomButton from '@/@core/components/mui/Button'
import CustomTextField from '@/@core/components/mui/TextField'
import { getFileTypes } from '@/api/metadata'

export const Form = () => {
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
