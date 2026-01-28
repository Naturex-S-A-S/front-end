import { useState, type FC } from 'react'

import { Icon } from '@iconify/react'

import { Chip, Grid, Stack } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import CustomButton from '@/@core/components/mui/Button'
import CustomCard from '@/@core/components/mui/Card'
import CustomDialog from '@/@core/components/mui/Dialog'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'

interface Props {
  data: {
    id: string
    name: string
  }[]
  list: {
    id: string
    name: string
  }[]
  update: (newCategories: string[]) => void
  isPending?: boolean
}

const Categories: FC<Props> = ({ data, list, update, isPending }) => {
  const [open, setOpen] = useState(false)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      category: null
    }
  })

  const toogleDialog = () => setOpen(!open)

  const handleAdd = (values: any) => {
    update(data.map(item => item.id).concat(values.category.id))
    reset()
    toogleDialog()
  }

  const handleDelete = (id: string) => {
    update(data.filter(item => item.id !== id).map(item => item.id))
  }

  return (
    <CustomCard
      title='Categorias'
      action={
        <CustomButton size='small' startIcon={<Icon icon='mdi:plus' />} onClick={toogleDialog} isLoading={isPending}>
          Agregar
        </CustomButton>
      }
    >
      {Array.isArray(data) && data.length === 0 && <span>No hay categorias</span>}

      <Stack direction='row' spacing={2} flexWrap='wrap'>
        {data.map(category => (
          <Chip
            key={category.id}
            variant='outlined'
            label={category.name}
            onDelete={() => handleDelete(category.id)}
            disabled={isPending}
          />
        ))}
      </Stack>

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Agregar Categoria' maxWidth='xs'>
        <form onSubmit={handleSubmit(handleAdd)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={list}
                    onChange={(e, value: any) => {
                      onChange(value)
                    }}
                    renderInput={params => (
                      <CustomTextField {...params} label='Categoria' placeholder='Seleccione una categoria' />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} display={'flex'} justifyContent={'center'}>
              <CustomButton size='small' type='submit'>
                Agregar
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </CustomDialog>
    </CustomCard>
  )
}

export default Categories
