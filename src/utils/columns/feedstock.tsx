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
  filters: any
  isPending: boolean
}

export const columns = ({ handleActive, filters, isPending }: params): GridColDef[] => {
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
              <IconButton onClick={() => router.push(`${PATHS.MATERIAL_PRIMA_DETAIL}/${params.row.id}`)}>
                <Icon icon='hugeicons:view' width={20} height={20} />
              </IconButton>
            )}
          </>
        )
      }
    },
    { field: 'name', headerName: 'Nombre', width: 150 },
    {
      field: 'quantityG',
      headerName: `Cantidad (${filters?.measureUnit?.value})`,
      width: 100,
      renderCell: params => {
        switch (filters?.measureUnit?.value) {
          case 't':
            return Number(params.row.quantityT).toFixed(2)
          case 'kg':
            return Number(params.row.quantityK).toFixed(2)
          case 'g':
            return Number(params.row.quantityG).toFixed(2)
          default:
            return Number(params.row.quantityG).toFixed(2)
        }
      }
    },
    {
      field: 'chargeG',
      headerName: 'Valor unitario',
      width: 150,
      minWidth: 150,
      renderCell: params => {
        switch (filters?.measureUnit?.value) {
          case 't':
            return Number(params.row.chargeT).toFixed(2)
          case 'kg':
            return Number(params.row.chargeKg).toFixed(2)
          case 'g':
            return Number(params.row.chargeG).toFixed(2)
          default:
            return Number(params.row.chargeG).toFixed(2)
        }
      }
    },
    {
      field: 'charge',
      headerName: 'Valor total',
      width: 100,
      renderCell: params => Number(params.row.charge).toFixed(2)
    },
    {
      field: 'allergen',
      headerName: 'Alergeno',
      width: 80,
      renderCell: params => (
        <div className='flex justify-center items-center' style={{ height: '100%' }}>
          {params.row.allergen ? (
            <Icon icon='lets-icons:check-fill' width={20} height={20} color='green' />
          ) : (
            <Icon icon='lets-icons:close-round-fill' width={20} height={20} color='gray' />
          )}
        </div>
      )
    },
    {
      field: 'categories',
      headerName: 'Categorias',
      width: 150,
      renderCell: params => {
        const visible = params.row.categories.slice(0, 1)
        const remaining = params.row.categories.slice(1)

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
