import { Chip, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

export const columns = (): GridColDef[] => {
  return [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 160 },
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
    { field: 'batch', headerName: 'Lote', width: 120 },
    { field: 'location', headerName: 'Ubicación', width: 120 },
    { field: 'rack', headerName: 'Estante', width: 120 },
    { field: 'observations', headerName: 'Observaciones', flex: 1, minWidth: 200 },
    { field: 'dateCreate', headerName: 'Fecha de creación', width: 180 }
  ]
}
