import { useState } from 'react'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/feedstock'
import Filter from './filter'
import useFeedstock from '@/hooks/feedstock/useFeedstock'
import usePatchFeedstock from '@/hooks/feedstock/usePatchFeedstock'

const defaultFilters = {
  category: undefined,
  measureUnit: { label: 'Gramo', value: 'g' },
  allergen: false,
  active: true
}

const List = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const { feedstock, isLoading } = useFeedstock(filters)
  const { handleActive, isPending } = usePatchFeedstock()

  const onApplyFilters = (filters: any) => {
    setFilters(filters)
  }

  return (
    <div className='flex flex-col gap-2'>
      {/*<Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />*/}
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={columns({ handleActive, filters, isPending })} data={feedstock} isLoading={isLoading} />
    </div>
  )
}

export default List
