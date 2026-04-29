import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/orderKardex'

interface IPropsAdjustmentList {
  data: any[]
  isLoading: boolean
}

const AdjustmentList = ({ data, isLoading }: IPropsAdjustmentList) => {
  return <CustomDataGrid columns={columns()} data={data} isLoading={isLoading} />
}

export default AdjustmentList
