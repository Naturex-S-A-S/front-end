import { Grid } from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import CustomCard from '@/@core/components/mui/Card'
import type { IProvider } from '@/types/pages/financeAdministation'
import Form from '../form'

interface IDetailProps {
  provider: IProvider
}

const Detail = ({ provider }: IDetailProps) => {
  const methods = useForm<IProvider>({
    defaultValues: provider
  })

  const { handleSubmit } = methods

  const onSubmit = () => {}

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomCard title='Información del Proveedor'>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Form isPending={false} isEdit />
            </form>
          </FormProvider>
        </CustomCard>
      </Grid>
    </Grid>
  )
}

export default Detail
