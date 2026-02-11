import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import Filter from './filter'
import { getMovements } from '@/api/product'
import { columns } from '@/utils/columns/productMovements'

const defaultFilters = {
  kardexType: undefined,
  product: undefined,
  batch: '',
  classification: '',
  orderId: ''
}

const Movements = () => {
  const [filters, setFilters] = useState({
    ...defaultFilters
  })

  const { data, isLoading } = useQuery({
    queryKey: ['getMovements', filters],
    queryFn: () => getMovements(filters)
  })

  const onApplyFilters = (filters: any) => {
    setFilters({
      ...filters
    })
  }

  return (
    <div className='flex flex-col gap-2'>
      {/*<Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />*/}
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid
        columns={columns()}
        getRowClassName={(params: any) => (params.row.type === 'input' ? 'input' : 'output')}
        data={data}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Movements
