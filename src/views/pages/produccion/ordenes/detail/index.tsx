import type { Theme } from '@mui/material'
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
  TableHead,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material'

import classNames from 'classnames'

import { formatDate } from '@/utils/format'
import type { IOrder } from '@/types/pages/order'
import Adjustment from './adjustment'

interface Props {
  order: IOrder
}

const STATUS_COLOR: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  en_proceso: 'warning',
  finalizada: 'success',
  cancelado: 'error'
}

const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  cancelado: 'Cancelado'
}

const Detail: React.FC<Props> = ({ order }) => {
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const getCardClass = () =>
    classNames({
      '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': isBelowMdScreen && !isBelowSmScreen,
      '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
    })

  const totalQuantityG = order.details?.reduce((a, b) => a + b.quantity, 0) ?? 0
  const totalQuantityTotal = order.details?.reduce((a, b) => a + b.quantityTotal, 0) ?? 0

  return (
    <Grid container spacing={4}>
      {/* Left panel */}
      <Grid item xs={12} md={4} height='100%'>
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' gap={4}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box>
                  <Typography variant='caption' color='textSecondary'>
                    Formulación
                  </Typography>
                  <Typography variant='h6'>{order.formulationName}</Typography>
                </Box>
                <Chip
                  label={STATUS_LABEL[order.status] ?? order.status}
                  color={STATUS_COLOR[order.status] ?? 'default'}
                  size='small'
                />
              </Box>

              <Divider />

              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' alignItems='center' justifyContent='space-between' gap={2}>
                  <Typography variant='body2' color='textSecondary' sx={{ flex: 1, minWidth: 0 }}>
                    Usuario
                  </Typography>
                  <Box sx={{ flexShrink: 0 }}>
                    <Typography
                      variant='body2'
                      fontWeight={600}
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      Deiby Andres Moreno
                    </Typography>
                  </Box>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Lote
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.batch}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Versión
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    v{order.idVersion}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de vencimiento
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.dateExpiration ? formatDate(order.dateExpiration) : '-'}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de creación
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.dateCreated ? formatDate(order.dateCreated) : '-'}
                  </Typography>
                </Box>
                {order.dateClosed && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='textSecondary'>
                      Fecha de cierre
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {formatDate(order.dateClosed)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider />

              <Typography variant='h6'>Presentaciones</Typography>

              {order.items?.map(item => (
                <Box
                  key={item.idFinalProduct}
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  gap={2}
                >
                  {/* Left: allow the name to wrap, grow and not overflow */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='body2'
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {item.finalProduct.name}
                    </Typography>
                    <Typography variant='caption' color='textSecondary' sx={{ display: 'block' }}></Typography>
                  </Box>
                  <Box display='flex' gap={1} sx={{ flexShrink: 0 }}>
                    <Chip label={`${item.quantityU} u`} size='small' color='primary' variant='outlined' />
                    <Chip
                      label={`${item.finalProduct.measurement} ${item.finalProduct.unit}`}
                      size='small'
                      variant='outlined'
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right panel */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={4}>
          {/* Stats */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6} md={3} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Cantidad esperada</Typography>
                        <Typography variant='h5'>{order.quantityExpected}</Typography>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Cantidad producida</Typography>
                        <Typography variant='h5'>{order.quantityProduced}</Typography>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Total base (g)</Typography>
                        <Typography variant='h5'>{totalQuantityG}</Typography>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Total general (g)</Typography>
                        <Typography variant='h5'>{totalQuantityTotal}</Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Materials table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Cantidad base (g)</TableCell>
                      <TableCell>Total (g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!order.details?.length ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                          Sin materiales registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      order.details.map(item => (
                        <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{item.idMaterial}</TableCell>
                          <TableCell>{item.nameMaterial}</TableCell>
                          <TableCell>
                            <Chip label={item.typeMaterial.replace('_', ' ')} size='small' variant='outlined' />
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.quantityTotal}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Adjustment materials={order.details} products={order.items} orderId={order.id} kardex={order.kardex} />
      </Grid>
    </Grid>
  )
}

export default Detail
