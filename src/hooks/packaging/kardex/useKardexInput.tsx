import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexInput } from '@/api/packaging'

const useKardexInput = () => {
  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      toast.success('Entrada de material de empaque registrada con éxito')
    },
    onError: (error: any) => {
      toast.error(
        JSON.stringify(error?.response?.data?.message).toString() ||
          'Error al registrar la entrada de material de empaque'
      )
    }
  })
}

export default useKardexInput
