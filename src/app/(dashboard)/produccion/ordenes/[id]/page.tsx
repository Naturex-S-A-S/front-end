'use client'

import { Box, Button } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Swal from 'sweetalert2'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import Detail from '@/views/pages/produccion/ordenes/detail'
import NotFound from '@/views/NotFound'
import useGetOrderById from '@/hooks/order/useGetOrderById'
import { patchStatusOrder } from '@/api/order'
import { alertMessageErrors } from '@/utils/messages'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const queryClient = useQueryClient()
  const { order, isLoading } = useGetOrderById(params.id)
  const mode = useTheme().palette.mode

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: (status: string) => patchStatusOrder(params.id, status),
    onSuccess: () => {
      toast.success('Orden actualizada con éxito')
      queryClient.invalidateQueries({
        queryKey: ['getOrderById', Number(params.id)]
      })
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al actualizar la orden')
    }
  })

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
        updateOrderStatus('finalizada')
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
        updateOrderStatus('cancelada')
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
            {order.status === 'en_proceso' && (
              <Button variant='contained' color='primary' onClick={handleFinalize}>
                Finalizar
              </Button>
            )}
            {order.status === 'en_proceso' && (
              <Button variant='outlined' color='error' onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </>
        }
      />
      <Detail order={order} />
    </Box>
  )
}

export default Page
