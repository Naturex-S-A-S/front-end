import { Card, CardContent, CardHeader } from '@mui/material'

interface Props {
  title: string
  children: React.ReactNode
}

const CustomCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Card className='w-full'>
      <CardHeader title={title} />
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default CustomCard
