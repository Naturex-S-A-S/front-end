'use client'

import { useState } from 'react'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import useGetOrders from '@/hooks/order/useGetOrders'
import { columns } from '@/utils/columns/order'
import Filter from './filter'
import CustomCard from '@/@core/components/mui/Card'

const defaultFilters = {
  product: undefined,
  status: undefined
}

export default function List() {
  const [filters, setFilters] = useState(defaultFilters)

  const { orders, isLoading } = useGetOrders(filters)

  return (
    <CustomCard>
      <Filter onApplyFilters={setFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={columns()} data={orders} isLoading={isLoading} />
    </CustomCard>
  )
}
