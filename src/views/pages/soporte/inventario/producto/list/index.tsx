import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { useColumns } from '@/utils/columns/product'
import useGetProduct from '@/hooks/product/useGetProduct'
import usePutProduct from '@/hooks/product/usePatchProduct'

const List = () => {
  const { product, isLoading } = useGetProduct()

  const { handleStatus, isPendingStatus } = usePutProduct()
  const colDefs = useColumns({ handleStatus, isPending: isPendingStatus })

  return (
    <div className='flex flex-col gap-2'>
      <CustomDataGrid
        columns={colDefs}
        data={product}
        isLoading={isLoading}
      />
    </div>
  )
}

export default List
