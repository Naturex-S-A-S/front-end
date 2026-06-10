'use client'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'

import { Chip } from '@mui/material'

import type { IPacking } from '@/types/pages/packing'

import { ActionButton } from './components/ActionButton'
import { PATHS } from '../paths'
import { formatDate } from '../format'

export const useColumns = (): GridColDef<IPacking>[] => {
  const router = useRouter()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      renderCell: params => (
        <ActionButton icon='hugeicons:view' onClick={() => router.push(`${PATHS.PRODUCT_DETAIL}/${params.row.id}`)} />
      )
    },
    { field: 'id', headerName: 'Código', width: 100 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    {
      field: 'measurement',
      headerName: 'Medida',
      width: 100,
      renderCell: params => (
        <span>
          {Number(params.row.measurement).toFixed(2)} {params.row.unit}
        </span>
      )
    },
    {
      field: 'packagingTotal',
      headerName: 'Total de empaques',
      width: 200,
      renderCell: params => (
        <div className='flex gap-2 justify-center items-center' style={{ height: '100%' }}>
          <Chip label={params.row.packagingTotal} />
        </div>
      )
    },
    {
      field: 'date',
      headerName: 'Fecha de creación',
      width: 150,
      renderCell: params => formatDate(params.row.date)
    }
  ]
}
