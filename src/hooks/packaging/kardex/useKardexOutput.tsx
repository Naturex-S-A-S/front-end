import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { postKardexOutput } from '@/api/packaging'

const useKardexOutput = () => {
  return useMutation({
    mutationFn: postKardexOutput,
    onSuccess: () => {
      toast.success('Salida de material de empaque registrada con éxito')
    },
    onError: (error: any) => {
      toast.error(
        JSON.stringify(error?.response?.data?.message).toString() ||
          'Error al registrar la salida de material de empaque'
      )
    }
  })
}

export default useKardexOutput
