import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/product'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de producto registrada con éxito')
    },
    onError: (error: any) => {
      toast.error(
        JSON.stringify(error?.response?.data?.message).toString() || 'Error al registrar la entrada de producto'
      )
    }
  })
}

export default useKardexInput
