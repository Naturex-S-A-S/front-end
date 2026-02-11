import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexOutput } from '@/api/product'

const useKardexOutput = () => {
  return useMutation({
    mutationFn: postKardexOutput,
    onSuccess: () => {
      toast.success('Salida de producto registrada con éxito')
    },
    onError: (error: any) => {
      toast.error(
        JSON.stringify(error?.response?.data?.message).toString() || 'Error al registrar la salida de producto'
      )
    }
  })
}

export default useKardexOutput
