'use client'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import useGetProviderById from '@/hooks/provider/useGetProviderById'
import NotFound from '@/views/NotFound'
import Detail from '@/views/pages/finanzas-y-administracion/proveedores/detail'

type Props = {
  params: { id: string }
}

const Page = ({ params }: Props) => {
  const { provider, isLoading } = useGetProviderById(params.id)
  const mode = useTheme().palette.mode

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!provider) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={provider.name}
        createdAt={provider.dateCreated.toString()}
        active={provider.active}
      />
      <Detail provider={provider} />
    </Box>
  )
}

export default Page
