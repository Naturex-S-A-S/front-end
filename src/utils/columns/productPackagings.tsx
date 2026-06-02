'use client'
import type { GridColDef } from '@mui/x-data-grid'

import type { IProductPackaging } from '@/types/pages/product'
import { formatDate } from '../format'

export const columns = (): GridColDef<IProductPackaging>[] => {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 180
    },
    {
      field: 'name',
      headerName: 'Nombre',
      width: 180,
      renderCell: params => params.row.packaging.name
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      width: 100
    },
    {
      field: 'packaging',
      headerName: 'Cargo',
      width: 100,
      renderCell: params =>
        params.row.packaging.chargeU != null ? Number(params.row.packaging.chargeU).toFixed(2) : '-'
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 100,
      renderCell: params =>
        params.row.packaging.color && <div className='flex items-center gap-2'>{params.row.packaging.color}</div>
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
