import { useRouter } from 'next/navigation'

import { IconButton, Tooltip } from '@mui/material'

import { Icon } from '@iconify/react'

type Props = {
  title?: string
  onReturn?: () => void
}

const BackButton: React.FC<Props> = ({ title = 'Regresar', onReturn }) => {
  const router = useRouter()

  const handleClick = () => {
    if (onReturn) {
      onReturn()
    } else {
      router.back()
    }
  }

  return (
    <Tooltip title={title}>
      <IconButton
        onClick={handleClick}
        aria-label={title}
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Icon icon='mdi:arrow-left' width={22} />
      </IconButton>
    </Tooltip>
  )
}

export default BackButton