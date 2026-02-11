'use client'

import { Chip, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { formatDate } from '../format'

export const columns = (): GridColDef[] => {
  return [
    { field: 'idFinalProduct', headerName: 'Codigo', width: 100 },
    { field: 'finalProductName', headerName: 'Producto', width: 150 },
    { field: 'batch', headerName: 'Lote', width: 100 },
    {
      field: 'idOrder',
      headerName: 'Orden',
      width: 100,
      minWidth: 100
    },
    {
      field: 'quantity',
      headerName: `Cantidad`,
      width: 120,
      renderCell: params => {
        const type = params.row.type
        const icon = type === 'input' ? '+' : '-'

        return (
          <Tooltip title={`${type === 'input' ? 'Entrada' : 'Salida'}`}>
            <Chip
              label={
                <span className='text-sm font-semibold'>
                  <span className='mr-1'>{icon}</span>
                  {params.row.quantity}
                </span>
              }
              color={type === 'input' ? 'success' : 'error'}
            />
          </Tooltip>
        )
      }
    },
    { field: 'classification', headerName: 'Clasificación', width: 150 },
    { field: 'observation', headerName: 'Observaciones', width: 150 },
    {
      field: 'expirationDate1',
      headerName: 'Fecha de vencimiento',
      width: 150
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de movimiento',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
