import { Card, CardContent, CardHeader } from '@mui/material'

interface Props {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

const CustomCard: React.FC<Props> = ({ title, children, action }) => {
  return (
    <Card className='w-full'>
      <CardHeader title={title} action={action} />
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default CustomCard
