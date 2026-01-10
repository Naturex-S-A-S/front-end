import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/feedstock'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de materia prima registrada con éxito')
    },
    onError: (error: any) => {
      toast.error(
        JSON.stringify(error?.response?.data?.message).toString() || 'Error al registrar la entrada de materia prima'
      )
    }
  })
}

export default useKardexInput
