import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/supplier'

const AdjustmentList = () => {
  return <CustomDataGrid columns={columns()} data={[]} isLoading={false} />
}

export default AdjustmentList
