'use client'

import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import NotFound from '@/views/NotFound'
import Detail from '@/views/pages/finanzas-y-administracion/ordenes-de-venta/detail'
import useGetSalesOrderById from '@/hooks/order/useGetSalesOrderById'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { saleOrder, isLoading } = useGetSalesOrderById(params.id)
  const mode = useTheme().palette.mode

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!saleOrder) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header name={saleOrder.fileName} />
      <Detail saleOrder={saleOrder} />
    </Box>
  )
}

export default Page
