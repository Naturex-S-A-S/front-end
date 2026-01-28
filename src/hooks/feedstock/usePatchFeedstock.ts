import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import Swal from "sweetalert2";

import { patchFeedstock } from "@/api/feedstock";


const usePatchFeedstock = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: any) => patchFeedstock(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getFeedstock'] });
            toast.success('Materia prima actualizado con éxito');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar la materia prima');
        }
    })

    const handleActive = (id: string, name: string, active: boolean, validate = true) => {
        if (validate) {
            Swal.fire({
                title: `¿Estás seguro de ${active ? 'desactivar' : 'activar'} "${name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#009541',
                cancelButtonColor: '#d33',
                confirmButtonText: active ? 'Desactivar' : 'Activar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    mutation.mutateAsync({
                        id,
                        data: { active: !active }
                    })
                }
            })
        } else {
            mutation.mutateAsync({
                id,
                data: { active: !active }
            })
        }
    }

    return {
        ...mutation,
        handleActive
    }
}

export default usePatchFeedstock;
