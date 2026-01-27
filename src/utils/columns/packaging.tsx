/* eslint-disable lines-around-comment */
'use client'

import { useRouter } from 'next/navigation'

import { Icon } from '@iconify/react'
import { Chip, IconButton, Switch, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { useAbility } from '@/hooks/casl/useAbility'
import Loader from '@/@core/components/react-spinners'
import { PATHS } from '../paths'

type params = {
  handleActive: (id: any, name: string, active: boolean) => void
  isPending: boolean
}

export const columns = ({ handleActive, isPending }: params): GridColDef[] => {
  const ability = useAbility()
  const router = useRouter()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      renderCell: params => {
        return (
          <>
            {ability.can('read', 'Soporte', 'Usuarios') && (
              <IconButton onClick={() => router.push(`${PATHS.MATERIAL_EMPAQUE_DETAIL}/${params.row.id}`)}>
                <Icon icon='hugeicons:view' width={20} height={20} />
              </IconButton>
            )}
          </>
        )
      }
    },
    { field: 'name', headerName: 'Nombre', width: 150 },
    {
      field: 'quantityTotal',
      headerName: `Cantidad`,
      width: 100
    },
    {
      field: 'chargeU',
      headerName: 'Valor unitario',
      width: 150,
      minWidth: 150,
      renderCell: params => Number(params.row.chargeU).toFixed(2)
    },
    {
      field: 'chargeTotal',
      headerName: 'Valor total',
      width: 100,
      renderCell: params => Number(params.row.chargeTotal).toFixed(2)
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 80
    },
    {
      field: 'categories',
      headerName: 'Categorias',
      width: 150,
      renderCell: params => {
        const visible = params.row.categories?.slice(0, 1)
        const remaining = params.row.categories?.slice(1)

        return (
          <div className='flex gap-2 justify-center items-center' style={{ height: '100%' }}>
            {visible.map((category: any) => (
              <Chip key={category.id ?? category.name} label={category.name} variant='outlined' />
            ))}

            {remaining.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {remaining.map((c: any, i: number) => (
                      <div key={c.id ?? `${c.name}-${i}`}>{c.name}</div>
                    ))}
                  </div>
                }
              >
                <Chip label={`+${remaining.length}`} variant='outlined' />
              </Tooltip>
            )}
          </div>
        )
      }
    },
    {
      field: 'active',
      headerName: 'Activo',
      width: 80,
      renderCell: params => (
        <div className='flex justify-center items-center' style={{ height: '100%' }}>
          <Tooltip title={params.row.active ? 'Desactivar' : 'Activar'}>
            {isPending ? (
              <Loader type='component' />
            ) : (
              <Switch
                checked={params.row.active}
                onChange={() => handleActive(params.row.id, params.row.name, params.row.active)}
                color={params.row.active ? 'success' : 'error'}
                // {...(params.row.active ? { 'data-testid': 'active-switch' } : {})}
                {...(ability.can('update', 'Soporte', 'Usuarios') ? { disabled: false } : { disabled: true })}
                {...(params.row.active ? { slotProps: { input: { 'aria-label': 'controlled' } } } : {})}
              />
            )}
          </Tooltip>
        </div>
      )
    }
  ]
}
