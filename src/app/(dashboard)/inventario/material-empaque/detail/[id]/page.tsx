'use client'
import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import useGetPackagingById from '@/hooks/packaging/useGetPackagingById'
import Detail from '@/views/pages/soporte/inventario/material-empaque/detail'
import usePatchPackaging from '@/hooks/packaging/usePatchPackaging'
import { useAbility } from '@/hooks/casl/useAbility'
import NotFound from '@/views/NotFound'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { packaging, isLoading } = useGetPackagingById(params.id)
  const { handleActive, isPending } = usePatchPackaging()
  const mode = useTheme().palette.mode
  const ability = useAbility()

  const canUpdate = ability.can('update', 'Material de empaque', 'Listado')

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!packaging) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={packaging.name}
        createdAt={packaging.dateCreated}
        active={packaging.active}
        handleActive={handleActive}
        canUpdate={canUpdate}
        isPending={isPending}
        quantity={packaging.quantityG}
      />
      <Detail packaging={packaging} />
    </Box>
  )
}

export default Page
