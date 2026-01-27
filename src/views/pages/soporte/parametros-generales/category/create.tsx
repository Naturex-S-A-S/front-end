'use client'
import { useState } from 'react'

import { Box } from '@mui/material'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateButton from '@/components/layout/shared/CreateButton'
import { useAbility } from '@/hooks/casl/useAbility'
import Form from './form'
import { getRoleModules, postRole } from '@/api/role'

const Create = () => {
  const [open, setOpen] = useState<boolean>(false)

  const queryClient = useQueryClient()
  const ability = useAbility()

  const toogleDialog = () => {
    setOpen(!open)
  }

  const { data: roleModules } = useQuery({
    queryKey: ['getRoleModules'],
    queryFn: getRoleModules
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: postRole,
    onSuccess: () => {
      toast.success('Rol creado con éxito')
      queryClient.invalidateQueries({ queryKey: ['getRoles'] })
      toogleDialog()
    },
    onError: () => {
      toast.error('Error al crear el rol')
    }
  })

  if (!ability.can('create', 'Soporte', 'Roles')) return null

  return (
    <Box>
      <CreateButton onClick={toogleDialog} />
      <Form
        open={open}
        toogleDialog={toogleDialog}
        mutate={mutateAsync}
        isLoadingMutate={isPending}
        roleModules={roleModules}
      />
    </Box>
  )
}

export default Create
