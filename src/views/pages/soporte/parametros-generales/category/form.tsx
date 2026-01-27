/* eslint-disable @typescript-eslint/no-unused-vars */
import CustomDialog from '@/@core/components/mui/Dialog'

interface FormProps {
  open: boolean
  toogleDialog: () => void
  defaultValues?: any
  mutate: (data: any) => Promise<void>
  isLoadingMutate: boolean
  roleModules: any
}

const Form = ({ open, toogleDialog, defaultValues, mutate, isLoadingMutate, roleModules }: FormProps) => {
  return (
    <CustomDialog
      open={open}
      toogleDialog={toogleDialog}
      title={defaultValues ? 'Editar Rol' : 'Crear Categoria'}
      maxWidth='lg'
    >
      <h1>Formulario de Categoria</h1>
    </CustomDialog>
  )
}

export default Form
