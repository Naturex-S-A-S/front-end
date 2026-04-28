'use client'

import { Chip, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { formatDate } from '../format'

export const columns = (): GridColDef[] => {
  return [
    { field: 'idFinalProduct', headerName: 'Código', width: 110 },
    { field: 'finalProductName', headerName: 'Producto', flex: 1, minWidth: 160 },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      width: 120,
      renderCell: params => {
        const type = params.row.type
        const icon = type === 'input' ? '+' : '-'

        return (
          <Tooltip title={type === 'input' ? 'Entrada' : 'Salida'}>
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
    { field: 'batch', headerName: 'Lote', width: 130 },
    { field: 'location', headerName: 'Ubicación', width: 100 },
    { field: 'rack', headerName: 'Estante', width: 100 },
    { field: 'classification', headerName: 'Clasificación', width: 150 },
    { field: 'observation', headerName: 'Observaciones', flex: 1, minWidth: 180 },
    {
      field: 'dateCreated',
      headerName: 'Fecha de movimiento',
      width: 170,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
