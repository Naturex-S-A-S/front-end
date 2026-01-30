'use client'

// ** Next Import
import { useState } from 'react'

import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { Icon } from '@iconify/react'

import Swal from 'sweetalert2'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import { Tooltip } from '@mui/material'

import useGetRoles from '@/hooks/role/useGetRoles'
import { useAbility } from '@/hooks/casl/useAbility'
import Form from './form'
import Loader from '@/@core/components/react-spinners'
import type { Role } from '@/types/pages/role'

import { deleteRole, getRoleById, updateRole } from '@/api/role'
import { useSettings } from '@/@core/hooks/useSettings'

const List = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [dataEdit, setDataEdit] = useState<Pick<Role, 'id' | 'name'> | undefined>(undefined)

  const queryClient = useQueryClient()

  const { settings } = useSettings()
  const { data: roles, isLoading, isRefetching, isFetching } = useGetRoles()
  const ability = useAbility()

  const canEdit = ability.can('update', 'Soporte', 'Roles')
  const canDelete = ability.can('delete', 'Soporte', 'Roles')

  const toogleDialog = () => {
    setOpen(!open)
  }

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ['getRoleById', dataEdit?.id],
    enabled: !!dataEdit?.id,
    queryFn: () => {
      if (dataEdit?.id) {
        return getRoleById(dataEdit.id)
      }

      return Promise.resolve(null)
    }
  })

  const { mutate: updateRoleMutation } = useMutation({
    mutationFn: (data: any) => updateRole(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getRoles'] })
      queryClient.invalidateQueries({ queryKey: ['getRoleById', dataEdit?.id] })
      toast.success('Rol actualizado con éxito')
      toogleDialog()
    },
    onError: () => {
      toast.error('Error al actualizar el rol')
    }
  })

  const handleEdit = (data: any) => {
    updateRoleMutation({ id: dataEdit?.id, ...data })
  }

  const { mutate: deleteRolMutation } = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getRoles'] })
      toast.success('Rol eliminado con éxito')
    },
    onError: () => {
      toast.error('Error al eliminar el rol')
    }
  })

  const handleDelete = (rolId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Eliminar el rol, no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#009541',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      theme: settings.mode === 'dark' ? 'dark' : 'light',
      background: settings.mode === 'dark' ? '#2f3349' : '#ffffff'
    }).then(result => {
      if (result.isConfirmed) {
        deleteRolMutation(rolId)
      }
    })
  }

  if (!ability.can('read', 'Soporte', 'Roles'))
    return <span className='text-textSecondary'>No tienes permisos de lectura</span>

  if (isLoading || isRefetching || isFetching) return <Loader type='component' />

  return (
    <Grid container spacing={6} className='match-height'>
      <Form
        open={open}
        toogleDialog={toogleDialog}
        mutate={handleEdit}
        defaultValues={dataEdit}
        isLoadingQuery={isLoadingRole}
        roleModules={role?.privileges || []}
      />
      {roles?.map((item, index: number) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary' }}>{`Total ${item.users_count || 0} usuarios`}</Typography>
                {/*<AvatarGroup
                max={4}
                className='pull-up'
                sx={{
                  '& .MuiAvatar-root': { width: 32, height: 32, fontSize: theme => theme.typography.body2.fontSize }
                }}
              >
                {item.avatars.map((img, index: number) => (
                  <Avatar key={index} alt={item.title} src={`/images/avatars/${img}`} />
                ))}
              </AvatarGroup>*/}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <Typography variant='h4' sx={{ mb: 1 }}>
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Typography>
                  {canEdit && (
                    <Typography
                      href='/'
                      component={Link}
                      sx={{ color: 'primary.main', textDecoration: 'none' }}
                      onClick={e => {
                        e.preventDefault()
                        setDataEdit(item)
                        toogleDialog()
                      }}
                    >
                      Editar Rol
                    </Typography>
                  )}
                </Box>
                {canDelete && (
                  <Tooltip
                    title={
                      item.users_count !== 0 ? 'No se puede eliminar un rol con usuarios asignados' : 'Eliminar Rol'
                    }
                  >
                    <span>
                      <IconButton
                        size='small'
                        sx={{ color: 'text.disabled' }}
                        disabled={item.users_count !== 0}
                        onClick={() => handleDelete(item.id.toString())}
                      >
                        <Icon icon='material-symbols:delete-outline' />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default List
