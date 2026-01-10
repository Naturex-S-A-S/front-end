import { useState } from 'react'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/packaging'
import Filter from './filter'
import useGetPackaging from '@/hooks/packaging/useGetPackaging'
import usePatchPackaging from '@/hooks/packaging/usePatchPackaging'

const defaultFilters = {
  category: undefined,
  measureUnit: { label: 'Gramo', value: 'g' },
  allergen: false,
  active: true
}

const List = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const { packaging, isLoading } = useGetPackaging(filters)
  const { handleActive, isPending } = usePatchPackaging()

  const onApplyFilters = (filters: any) => {
    setFilters(filters)
  }

  return (
    <div className='flex flex-col gap-2'>
      {/*<Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />*/}
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={columns({ handleActive, filters, isPending })} data={packaging} isLoading={isLoading} />
    </div>
  )
}

export default List
