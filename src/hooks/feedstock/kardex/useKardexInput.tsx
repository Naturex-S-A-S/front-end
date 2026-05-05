import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/feedstock'
import { alertMessageErrors } from '@/utils/messages'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de materia prima registrada con éxito')
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al registrar la entrada de materia prima')
    }
  })
}

export default useKardexInput
