import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/product'
import useGetProduct from '@/hooks/product/useGetProduct'
import usePutProduct from '@/hooks/product/usePatchProduct'

const List = () => {
  const { product, isLoading } = useGetProduct()

  const { handleStatus, isPendingStatus } = usePutProduct()

  return (
    <div className='flex flex-col gap-2'>
      <CustomDataGrid
        columns={columns({ handleStatus, isPending: isPendingStatus })}
        data={product}
        isLoading={isLoading}
      />
    </div>
  )
}

export default List
