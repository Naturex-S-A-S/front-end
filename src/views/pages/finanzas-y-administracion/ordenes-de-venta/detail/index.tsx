import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { formatDate } from '@/utils/format'
import type { ISaleOrder } from '@/types/pages/saleOrder'
import Kardex from './kardex'

interface Props {
  saleOrder: ISaleOrder
}

const TYPE_LABEL: Record<string, string> = {
  remision_venta: 'Remisión de venta',
  ventas_siigo: 'Ventas Siigo'
}

const Detail: React.FC<Props> = ({ saleOrder }) => {
  return (
    <Grid container spacing={4}>
      {/* Left panel */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' gap={3}>
              <Box>
                <Typography variant='caption' color='textSecondary'>
                  Tipo de archivo
                </Typography>
                <Typography variant='h6'>{TYPE_LABEL[saleOrder.type] ?? saleOrder.type}</Typography>
              </Box>

              <Divider />

              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Usuario
                  </Typography>
                  <Typography
                    variant='body2'
                    fontWeight={600}
                    sx={{ maxWidth: 180, textAlign: 'right', wordBreak: 'break-word' }}
                  >
                    {saleOrder.userFullName}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de carga
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {formatDate(saleOrder.dateCreated)}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box>
                  <Typography variant='caption' color='textSecondary'>
                    Total de productos vendidos
                  </Typography>
                  <Typography variant='h5'>{saleOrder.quantity}</Typography>
                </Box>
                <Box textAlign='right'>
                  <Typography variant='caption' color='textSecondary'>
                    Costo total
                  </Typography>
                  <Typography variant='h5'>${saleOrder.charge.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right panel */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant='h6' mb={2}>
              Productos vendidos
            </Typography>
            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Presentación</TableCell>
                    <TableCell align='right'>Cantidad</TableCell>
                    <TableCell align='right'>Costo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!saleOrder.details?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                        Sin productos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    saleOrder.details.map(item => (
                      <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{item.finalProduct.id}</TableCell>
                        <TableCell>{item.finalProduct.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${item.finalProduct.measurement} ${item.finalProduct.unit}`}
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell align='right'>{item.quantity}</TableCell>
                        <TableCell align='right'>${item.charge.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Kardex data={saleOrder.kardexProducts} />
      </Grid>
    </Grid>
  )
}

export default Detail
