import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/product'
import { alertMessageErrors } from '@/utils/messages'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de producto registrada con éxito')
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al registrar la entrada de producto')
    }
  })
}

export default useKardexInput
