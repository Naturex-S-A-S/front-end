'use client'

import { Box, Button } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Swal from 'sweetalert2'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import Detail from '@/views/pages/produccion/ordenes/detail'
import NotFound from '@/views/NotFound'
import useGetOrderById from '@/hooks/order/useGetOrderById'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { order, isLoading } = useGetOrderById(params.id)
  const mode = useTheme().palette.mode

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!order) {
    return <NotFound mode={mode} />
  }

  const handleFinalize = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas finalizar la orden?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#009541',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        // Logic to finalize the order
      }
    })
  }

  const handleCancel = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas cancelar la orden?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        // Logic to cancel the order
      }
    })
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={order.formulationName}
        createdAt={order.dateCreated}
        actions={
          <>
            <Button variant='contained' color='primary' onClick={handleFinalize}>
              Finalizar
            </Button>
            <Button variant='outlined' color='error' onClick={handleCancel}>
              Cancelar
            </Button>
          </>
        }
      />
      <Detail order={order} />
    </Box>
  )
}

export default Page
