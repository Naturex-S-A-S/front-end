'use client'

import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { useColumns } from '@/utils/columns/supplier'
import useGetProviders from '@/hooks/provider/useGetProviders'

export default function List() {
  const { providers, isLoading } = useGetProviders()
  const colDefs = useColumns()

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={providers} isLoading={isLoading} />
    </CustomCard>
  )
}
