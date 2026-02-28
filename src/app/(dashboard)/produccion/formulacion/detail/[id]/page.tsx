'use client'
import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import Detail from '@/views/pages/produccion/formulacion/detail'
import NotFound from '@/views/NotFound'
import useGetFormulationById from '@/hooks/formulation/useGetFormulationById'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { formulation, isLoading } = useGetFormulationById(params.id)
  const mode = useTheme().palette.mode

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!formulation) {
    return <NotFound mode={mode} />
  }

  const version = formulation.versions.find(version => version.active)

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={formulation.name}
        createdAt={formulation.dateCreated.toString()}
        version={version?.sequentialNumber}
      />
      <Detail formulation={formulation} />
    </Box>
  )
}

export default Page
