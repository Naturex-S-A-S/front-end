'use client'

import { Chip, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { formatDate } from '../format'

type params = {
  handleEdit?: (user: any) => void
  handleDelete?: (userId: any) => void
  filters: any
}

export const columns = ({ filters }: params): GridColDef[] => {
  return [
    /*{
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: params => {
        return (
          <>
            {ability.can('update', 'Soporte', 'Usuarios') && (
              <IconButton onClick={() => handleEdit(params.row)}>
                <Icon icon='mdi:pencil-outline' width={20} height={20} />
              </IconButton>
            )}
            {ability.can('delete', 'Soporte', 'Usuarios') && (
              <IconButton
                onClick={() => {
                  handleDelete(params.row.id)
                }}
              >
                <Icon icon='mdi:delete-outline' width={20} height={20} />
              </IconButton>
            )}
          </>
        )
      }
    },*/
    { field: 'batch', headerName: 'Lote', width: 100 },
    { field: 'materialName', headerName: 'Material', width: 150 },
    {
      field: 'quantityG',
      headerName: `Cantidad (${filters?.measureUnit?.value})`,
      width: 120,
      renderCell: params => {
        const type = params.row.type
        let quantity = ''
        const icon = type === 'input' ? '+' : '-'

        switch (filters?.measureUnit?.value) {
          case 't':
            quantity = Number(params.row.quantityT).toFixed(2)
          case 'kg':
            quantity = Number(params.row.quantityK).toFixed(2)
          case 'g':
            quantity = Number(params.row.quantityG).toFixed(2)
          default:
            quantity = Number(params.row.quantityG).toFixed(2)
        }

        return (
          <Tooltip title={`${type === 'input' ? 'Entrada' : 'Salida'} por ${filters?.measureUnit?.label}`}>
            <Chip
              label={
                <span className='text-sm font-semibold'>
                  <span className='mr-1'>{icon}</span>
                  {quantity}
                </span>
              }
              color={type === 'input' ? 'success' : 'error'}
            />
          </Tooltip>
        )
      }
    },
    {
      field: 'amountKg',
      headerName: 'Valor unitario',
      width: 150,
      minWidth: 150
    },
    {
      field: 'charge',
      headerName: 'Valor total',
      width: 100,
      renderCell: params => Number(params.row.charge).toFixed(2)
    },
    { field: 'providerName', headerName: 'Proveedor', width: 150 },
    {
      field: 'expirationDate1',
      headerName: 'Fecha de vencimiento',
      width: 150
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
