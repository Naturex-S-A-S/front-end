import CustomBox from '@/@core/components/mui/Box'
import List from '@/views/pages/produccion/formulacion/list'
import Create from '@/views/pages/produccion/formulacion/create'

export const metadata = {
  title: 'Formulacion - Naturex',
  description: ''
}

const FormulationPage = async () => {
  return (
    <CustomBox title='Formulacion'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default FormulationPage
