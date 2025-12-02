import { Icon } from '@iconify/react'

import CustomIconButton from '@/@core/components/mui/IconButton'

type Props = {
  onClick?: () => void
}

const CreateButton: React.FC<Props> = ({ onClick }) => {
  return (
    <CustomIconButton color='primary' size='large' variant='contained' className='p-2 rounded-full' onClick={onClick}>
      <Icon icon='ic:baseline-plus' width='40' height='40' />
    </CustomIconButton>
  )
}

export default CreateButton
