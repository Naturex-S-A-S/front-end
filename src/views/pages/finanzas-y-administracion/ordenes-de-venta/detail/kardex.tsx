import { Card, CardContent, Typography } from '@mui/material'

import type { ISaleOrderKardex } from '@/types/pages/saleOrder'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/saleOrderKardex'

interface IProps {
  data: ISaleOrderKardex[]
}

const Kardex: React.FC<IProps> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant='h6' mb={2}>
          Movimientos
        </Typography>
        {data.length === 0 ? (
          <Typography variant='body2' color='textSecondary'>
            No hay movimientos registrados
          </Typography>
        ) : (
          <CustomDataGrid columns={columns()} data={data} />
        )}
      </CardContent>
    </Card>
  )
}

export default Kardex
