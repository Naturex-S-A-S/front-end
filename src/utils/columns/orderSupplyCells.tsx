import { memo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Chip, IconButton, Tooltip } from '@mui/material'

import { Icon } from '@iconify/react'

import { formatDate } from '../format'

const ActionsCell = memo(({ orderId }: { orderId: number }) => {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(`/produccion/aprovisionamiento/${orderId}`)
  }, [router, orderId])

  return (
    <IconButton onMouseDown={e => e.stopPropagation()} onClick={handleClick}>
      <Icon icon='mdi:eye-outline' width={20} height={20} />
    </IconButton>
  )
})

ActionsCell.displayName = 'ActionsCell'

const ProductNamesCell = memo(({ productNames }: { productNames: string[] }) => {
  const visible = productNames?.slice(0, 2) ?? []
  const remaining = productNames?.slice(2) ?? []

  return (
    <div className='flex gap-2 items-center' style={{ height: '100%' }}>
      {visible.map((name, i) => (
        <Tooltip key={i} title={name}>
          <Chip label={name.length > 14 ? `${name.slice(0, 14)}…` : name} variant='outlined' size='small' />
        </Tooltip>
      ))}
      {remaining.length > 0 && (
        <Tooltip
          title={
            <div>
              {remaining.map((name, i) => (
                <div key={i}>{name}</div>
              ))}
            </div>
          }
        >
          <Chip label={`+${remaining.length}`} variant='outlined' size='small' />
        </Tooltip>
      )}
    </div>
  )
})

ProductNamesCell.displayName = 'ProductNamesCell'

const QuantityCell = memo(({ value }: { value: number | string }) => (
  <Box className='flex items-center' style={{ height: '100%' }}>
    {value}
  </Box>
))

QuantityCell.displayName = 'QuantityCell'

const DateCell = memo(({ value }: { value: string }) => (
  <>{formatDate(value)}</>
))

DateCell.displayName = 'DateCell'

export { ActionsCell, ProductNamesCell, QuantityCell, DateCell }
