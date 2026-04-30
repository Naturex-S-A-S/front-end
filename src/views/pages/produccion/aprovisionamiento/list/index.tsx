'use client'

import { useState, useMemo, useDeferredValue } from 'react'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import useGetOrderSupply from '@/hooks/order/useGetOrderSupply'
import { columns } from '@/utils/columns/orderSupply'
import Filter from './filter'
import CustomCard from '@/@core/components/mui/Card'

const defaultFilters = {
  product: undefined,
  status: undefined
}

export default function List() {
  const [filters, setFilters] = useState(defaultFilters)
  const deferredFilters = useDeferredValue(filters)

  const { orderSupplies, isLoading } = useGetOrderSupply(deferredFilters)

  const columnsMemoized = useMemo(() => columns(), [])

  return (
    <CustomCard>
      <Filter onApplyFilters={setFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={columnsMemoized} data={orderSupplies} isLoading={isLoading} />
    </CustomCard>
  )
}
