'use client'

import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { useGetPacking } from '@/hooks/packing'
import { useColumns } from '@/utils/columns/packing'

const List = () => {
  const { data, isLoading } = useGetPacking()
  const colDefs = useColumns()

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={data} isLoading={isLoading} />
    </CustomCard>
  )
}

export default List
