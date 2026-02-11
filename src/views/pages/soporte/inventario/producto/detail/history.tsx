import type { FC } from 'react'

import type { IProductHistory } from '@/types/pages/product'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/productHistory'

interface IProps {
  list: IProductHistory[]
}

const History: FC<IProps> = ({ list }) => {
  return <CustomDataGrid columns={columns()} data={list} />
}

export default History
