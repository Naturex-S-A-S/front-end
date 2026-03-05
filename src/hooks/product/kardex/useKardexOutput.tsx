import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexOutput } from '@/api/product'
import { alertMessageErrors } from '@/utils/messages'

const useKardexOutput = () => {
  return useMutation({
    mutationFn: postKardexOutput,
    onSuccess: () => {
      toast.success('Salida de producto registrada con éxito')
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al registrar la salida de producto')
    }
  })
}

export default useKardexOutput
