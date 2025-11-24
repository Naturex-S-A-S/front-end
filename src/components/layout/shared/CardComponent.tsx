import { Card, CardContent, CardHeader } from '@mui/material'

interface Props {
  title: string
  children: React.ReactNode
}

const CardComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default CardComponent
