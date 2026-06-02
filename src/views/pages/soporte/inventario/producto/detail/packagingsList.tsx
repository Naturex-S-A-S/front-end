import type { FC } from 'react'

import type { IProductPackaging } from '@/types/pages/product'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/productPackagings'

interface IProps {
  list: IProductPackaging[]
}

const PackagingsList: FC<IProps> = ({ list }) => {
  return <CustomDataGrid columns={columns()} data={list} />
}

export default PackagingsList
