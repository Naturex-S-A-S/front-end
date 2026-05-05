'use client'
import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import Swal from 'sweetalert2'

import toast from 'react-hot-toast'

import CustomCard from '@/@core/components/mui/Card'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { deleteUser, getUsers } from '@/api/user'
import { columns } from '@/utils/columns/user'
import Edit from './edit'
import { alertMessageErrors } from '@/utils/messages'

const List = () => {
  const [userEdit, setUserEdit] = useState(undefined)
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['getUsers'],
    queryFn: getUsers
  })

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getUsers'] })
      toast.success('Usuario eliminado con éxito')
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al eliminar el usuario')
    }
  })

  const handleDialog = () => {
    setOpen(!open)
    setUserEdit(undefined)
  }

  const handleEdit = (user: any) => {
    handleDialog()
    setUserEdit(user)
  }

  const handleDelete = (userId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Eliminar el usuario, no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#009541',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        deleteUserMutation(userId)
      }
    })
  }

  return (
    <CustomCard title=''>
      <Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />
      <CustomDataGrid columns={columns({ handleEdit, handleDelete })} data={data} />
    </CustomCard>
  )
}

export default List
