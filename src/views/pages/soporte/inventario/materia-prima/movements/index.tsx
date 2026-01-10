import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/movements'
import Filter from './filter'
import { getKardexMovements } from '@/api/kardex'
import { MaterialType } from '@/utils/enum'

const defaultFilters = {
  kardexType: null,
  providerId: null,
  batch: '',
  materialType: MaterialType.FEEDSTOCK,
  measureUnit: { label: 'Gramo', value: 'g' }
}

const Movements = () => {
  const [filters, setFilters] = useState(defaultFilters)

  const { data, isLoading } = useQuery({
    queryKey: ['getKardexMovements', filters],
    queryFn: () => getKardexMovements(filters)
  })

  const onApplyFilters = (filters: any) => {
    setFilters(filters)
  }

  const handleEdit = (id: string) => {
    toast(`${id} Pendiente`)
  }

  const handleDelete = (id: string) => {
    toast(`${id} Pendiente`)
  }

  return (
    <div className='flex flex-col gap-2'>
      {/*<Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />*/}
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid
        columns={columns({ handleEdit, handleDelete, filters })}
        getRowClassName={(params: any) => (params.row.type === 'input' ? 'input' : 'output')}
        data={data}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Movements
