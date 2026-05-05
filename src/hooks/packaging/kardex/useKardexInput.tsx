import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/packaging'
import { alertMessageErrors } from '@/utils/messages'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de material de empaque registrada con éxito')
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al registrar la entrada de material de empaque')
    }
  })
}

export default useKardexInput
