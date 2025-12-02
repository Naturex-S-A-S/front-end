import { Box } from '@mui/material'

interface Props {
  children: React.ReactNode
}

const CustomBox: React.FC<Props> = ({ children }) => {
  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' width='100%' gap={4}>
      {children}
    </Box>
  )
}

export default CustomBox
