'use client'
import type { GridColDef } from '@mui/x-data-grid'

import { formatDate } from '../format'

export const columns = (): GridColDef[] => {
  return [
    { field: 'id', headerName: 'Id', width: 80 },
    { field: 'quantityInProcess', headerName: 'En proceso', width: 120 },
    { field: 'quantityCompleted', headerName: 'Completados', width: 120 },
    {
      field: 'total',
      headerName: 'Total',
      width: 100,
      renderCell: params => params.row.quantityInProcess + params.row.quantityCompleted
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
