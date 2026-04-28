'use client'

import { useState } from 'react'

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

  const { orderSupplies, isLoading } = useGetOrderSupply(filters)

  return (
    <CustomCard>
      <Filter onApplyFilters={setFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={columns()} data={orderSupplies} isLoading={isLoading} />
    </CustomCard>
  )
}
