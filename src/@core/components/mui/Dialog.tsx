import { Icon } from '@iconify/react'
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'

type Props = {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  title: string
  children?: React.ReactNode
  open: boolean
  toogleDialog: () => void
}

const CustomDialog: React.FC<Props> = ({ open, toogleDialog, children, title, maxWidth = 'md' }) => {
  return (
    <Dialog open={open} onClose={toogleDialog} fullWidth maxWidth={maxWidth}>
      <DialogTitle textAlign={'center'}>{title}</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={toogleDialog}
        sx={theme => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500]
        })}
      >
        <Icon icon='ic:round-close' />
      </IconButton>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}

export default CustomDialog
