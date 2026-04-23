'use client'
import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import useGetSalesOrder from '@/hooks/order/useGetSalesOrder'
import { columns } from '@/utils/columns/saleOrder'

const List = () => {
  const { salesOrder, isLoading } = useGetSalesOrder()

  return (
    <CustomCard>
      <CustomDataGrid columns={columns()} data={salesOrder} isLoading={isLoading} />
    </CustomCard>
  )
}

export default List
