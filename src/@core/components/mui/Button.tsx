import type { ButtonProps } from '@mui/material'
import { Button, CircularProgress } from '@mui/material'

type Props = ButtonProps & {
  isLoading: boolean
  text: string
}

const CustomButton: React.FC<Props> = ({ isLoading, text, ...props }) => {
  return (
    <Button {...props} variant='contained' disabled={isLoading}>
      {isLoading ? <CircularProgress size={20} color='inherit' /> : text}
    </Button>
  )
}

export default CustomButton
