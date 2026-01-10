import type { ButtonProps } from '@mui/material'
import { Button, CircularProgress } from '@mui/material'

type Props = ButtonProps & {
  isLoading?: boolean
  text?: string
  children?: React.ReactNode
}

const CustomButton: React.FC<Props> = ({ isLoading, text, children, ...props }) => {
  return (
    <Button {...props} variant={props.variant || 'contained'} disabled={isLoading}>
      {isLoading ? <CircularProgress size={20} color='inherit' /> : children || text}
    </Button>
  )
}

export default CustomButton
