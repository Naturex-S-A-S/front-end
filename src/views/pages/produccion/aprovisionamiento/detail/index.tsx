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
import type { IOrderSupply } from '@/types/pages/order'

interface Props {
  orderSupply: IOrderSupply
}

const Detail: React.FC<Props> = ({ orderSupply }) => {
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const getCardClass = () =>
    classNames({
      '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': isBelowMdScreen && !isBelowSmScreen,
      '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
    })

  return (
    <Grid container spacing={4}>
      {/* Left panel */}
      <Grid item xs={12} md={4} height='100%'>
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' gap={4}>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Lote
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {orderSupply.batch}
                  </Typography>
                </Box>

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
                      {orderSupply.userName}
                    </Typography>
                  </Box>
                </Box>

                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de creación
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {orderSupply.dateCreated ? formatDate(orderSupply.dateCreated) : '-'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Typography variant='h6'>Productos</Typography>

              {orderSupply.products?.map(product => (
                <Box
                  key={product.id}
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  gap={2}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='body2'
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {product.fullName}
                    </Typography>
                  </Box>
                  <Chip label={`${product.units} u`} size='small' color='primary' variant='outlined' />
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
                  <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Total en kg</Typography>
                        <Typography variant='h5'>{orderSupply.totalQuantityInKg}</Typography>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Total en unidades</Typography>
                        <Typography variant='h5'>{orderSupply.totalQuantityInUnits}</Typography>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                    <div className='flex h-full'>
                      <div className='flex flex-col justify-between'>
                        <Typography variant='caption'>Costo total</Typography>
                        <Typography variant='h5'>{orderSupply.totalChargeOrder}</Typography>
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
                      <TableCell>Cant. disponible</TableCell>
                      <TableCell>Cant. faltante</TableCell>
                      <TableCell>Cant. total orden</TableCell>
                      <TableCell>Costo total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!orderSupply.materials?.length ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                          Sin materiales registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      orderSupply.materials.map(item => (
                        <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantityAvailable}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.quantityMissing}
                              size='small'
                              color={item.quantityMissing > 0 ? 'error' : 'success'}
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>{item.quantityTotalOrder}</TableCell>
                          <TableCell>{item.totalCost}</TableCell>
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
    </Grid>
  )
}

export default Detail
