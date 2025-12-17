import { Box, Typography } from '@mui/material'

import PageHeader from '../page-header'

interface Props {
  children: React.ReactNode
  title?: string
}

const CustomBox: React.FC<Props> = ({ title, children }) => {
  return (
    <>
      <PageHeader title={<Typography variant='h4'>{title}</Typography>} />
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' width='100%' gap={4}>
        {children}
      </Box>
    </>
  )
}

export default CustomBox
