'use client'
import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import Detail from '@/views/pages/soporte/inventario/materia-prima/detail'
import { useAbility } from '@/hooks/casl/useAbility'
import NotFound from '@/views/NotFound'
import useGetFeedstockById from '@/hooks/feedstock/useGetFeedstockById'
import usePatchFeedstock from '@/hooks/feedstock/usePatchFeedstock'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { feedstock, isLoading } = useGetFeedstockById(params.id)
  const { handleActive, isPending } = usePatchFeedstock()
  const mode = useTheme().palette.mode
  const ability = useAbility()

  const canUpdate = ability.can('update', 'Materia prima', 'Listado')

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!feedstock) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={feedstock.name}
        createdAt={feedstock.dateCreated}
        active={feedstock.active}
        handleActive={handleActive}
        canUpdate={canUpdate}
        isPending={isPending}
        quantity={feedstock.quantityG}
      />
      <Detail feedstock={feedstock} />
    </Box>
  )
}

export default Page
