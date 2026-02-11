'use client'

import { Chip, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import moment from 'moment'

/*{
    "id": 18,
    "type": "output",
    "classification": null,
    "observation": "test",
    "batch": "05062025",
    "rack": null,
    "location": null,
    "quantity": 1,
    "dateCreated": "2026-02-06T20:34:05.852778",
    "expirationDate1": null,
    "expirationDate2": null,
    "idUser": "ce4121ea95f6ce0991397882a3600f7bc9550254f24a4f67a80f66eec3ed5bd3",
    "idOrder": 1,
    "idFinalProduct": "ASED789"
}*/

export const columns = (): GridColDef[] => {
  return [
    { field: 'idFinalProduct', headerName: 'Product', width: 150 },
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
      renderCell: params => moment(params.row.dateCreated).format('YYYY-MM-DD')
    }
  ]
}
