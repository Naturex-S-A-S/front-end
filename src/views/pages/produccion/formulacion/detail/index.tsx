import { Grid } from '@mui/material'

import CustomCard from '@/@core/components/mui/Card'
import type { IFormulation } from '@/types/pages/formulation'
import Versions from './versions'
import Products from './products'

interface Props {
  formulation: IFormulation
}

const Detail: React.FC<Props> = ({ formulation }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={8}>
        <CustomCard title='Historial de versiones'>
          <Versions data={formulation.versions} formulationId={formulation.id} />
        </CustomCard>
      </Grid>
      <Grid item xs={12} sm={4}>
        <CustomCard title='Productos relacionados'>
          <Products products={formulation.productFormulations} />
        </CustomCard>
      </Grid>
    </Grid>
  )
}

export default Detail
