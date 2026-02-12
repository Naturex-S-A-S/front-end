'use client'
import { useMemo } from 'react'

import { Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import Loader from '@/@core/components/react-spinners'
import Header from '@/components/layout/detail/inventory/Header'
import { useAbility } from '@/hooks/casl/useAbility'
import NotFound from '@/views/NotFound'
import usePatchProduct from '@/hooks/product/usePatchProduct'
import useGetProductById from '@/hooks/product/useGetProductById'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import Detail from '@/views/pages/soporte/inventario/producto/detail'

type Props = {
  params: { id: string }
}

const Page: React.FC<Props> = ({ params }) => {
  const { product, isLoading } = useGetProductById(params.id)
  const { handleStatus, isPending } = usePatchProduct()
  const mode = useTheme().palette.mode
  const ability = useAbility()

  const canUpdate = ability.can(ABILITY_ACTIONS.UPDATE as any, ABILITY_SUBJECT.PRODUCT, ABILITY_FIELDS.LISTADO)

  const quantity = useMemo(() => {
    if (!Array.isArray(product?.productHistory) || product?.productHistory.length === 0) return 0

    const productHistory = product.productHistory[0]

    return productHistory?.quantityInProcess + productHistory?.quantityCompleted
  }, [product?.productHistory])

  if (isLoading) {
    return <Loader type='page' />
  }

  if (!product) {
    return <NotFound mode={mode} />
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={product.name}
        createdAt={product.dateCreated}
        active={product.active}
        handleActive={handleStatus}
        canUpdate={canUpdate}
        isPending={isPending}
        quantity={quantity}
      />
      <Detail product={product} />
    </Box>
  )
}

export default Page
