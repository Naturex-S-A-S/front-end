'use client'
import { useState } from 'react'

import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import useGetFormulation from '@/hooks/formulation/useGetFormulation'
import { useColumns } from '@/utils/columns/formulation'
import Filter from './filter'

const defaultFilters = {
  product: undefined
}

export default function List() {
  const [filters, setFilters] = useState(defaultFilters)

  const { formulations, isLoading } = useGetFormulation(filters)
  const colDefs = useColumns()

  const onApplyFilters = (filters: any) => {
    setFilters({
      ...filters
    })
  }

  return (
    <CustomCard>
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={colDefs} data={formulations} isLoading={isLoading} />
    </CustomCard>
  )
}
