'use client'

import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import Detail from '@/views/pages/produccion/aprovisionamiento/detail'
import NotFound from '@/views/NotFound'
import useGetOrderSupplyById from '@/hooks/order/useGetOrderSupplyById'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { orderSupply, isLoading } = useGetOrderSupplyById(params.id)
  const mode = useTheme().palette.mode

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!orderSupply) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={orderSupply.batch}
        createdAt={orderSupply.dateCreated}
      />
      <Detail orderSupply={orderSupply} />
    </Box>
  )
}

export default Page
