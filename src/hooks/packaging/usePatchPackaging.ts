import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import Swal from "sweetalert2";

import { patchPackaging } from "@/api/packaging";

const usePatchPackaging = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: any) => patchPackaging(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getPackaging'] });
            queryClient.invalidateQueries({ queryKey: ['getPackagingById'] });
            toast.success('Material de empaque actualizado con éxito');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar el material de empaque');
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

export default usePatchPackaging;
