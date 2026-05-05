import type { IconButtonProps } from '@mui/material'
import { IconButton } from '@mui/material'
import { Icon } from '@iconify/react'

interface ActionButtonProps extends Omit<IconButtonProps, 'children'> {
  icon: string
  iconWidth?: number
  iconHeight?: number
}

export const ActionButton = ({ icon, iconWidth = 20, iconHeight = 20, ...props }: ActionButtonProps) => {
  return (
    <IconButton onMouseDown={e => e.stopPropagation()} {...props}>
      <Icon icon={icon} width={iconWidth} height={iconHeight} />
    </IconButton>
  )
}
