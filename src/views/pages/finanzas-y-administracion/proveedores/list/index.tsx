'use client'

import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/supplier'
import useGetProviders from '@/hooks/provider/useGetProviders'

export default function List() {
  const { providers, isLoading } = useGetProviders()

  return (
    <CustomCard>
      <CustomDataGrid columns={columns()} data={providers} isLoading={isLoading} />
    </CustomCard>
  )
}
