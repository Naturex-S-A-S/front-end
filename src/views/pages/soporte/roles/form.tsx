import { Fragment, useEffect, useMemo, useState } from 'react'

import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import { Icon } from '@iconify/react'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomButton from '@/@core/components/mui/Button'
import CustomDialog from '@/@core/components/mui/Dialog'
import { defaultRoleValues } from '@/utils/defaultValues/role'
import Loader from '@/@core/components/react-spinners'

type Props = {
  mutate: (data: any) => void
  isLoadingMutate?: boolean
  isLoadingQuery?: boolean
  open: boolean
  toogleDialog: () => void
  defaultValues?: {
    id: number
    name: string
  }
  roleModules: any[]
}

const Form: React.FC<Props> = ({
  mutate,
  open,
  toogleDialog,
  defaultValues,
  isLoadingMutate = false,
  isLoadingQuery = false,
  roleModules
}) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])

  const allActionIds = useMemo(() => {
    const ids: string[] = []

    roleModules?.forEach(role => {
      role.children?.forEach((module: any) => {
        // Si el módulo tiene sub-items
        if (module.children && module.children.length > 0) {
          module.children.forEach((item: any) => {
            const actionsObj = item.actions ?? {
              read: false,
              create: false,
              update: false,
              delete: false
            }

            Object.keys(actionsObj).forEach(action => {
              actionsObj[action] && ids.push(`${role.id}-${module.id}-${item.id}-${action}`)
            })
          })
        } else {
          // El módulo mismo actúa como item (no tiene children)
          const actionsObj = module.actions ?? {
            read: false,
            create: false,
            update: false,
            delete: false
          }

          // Usamos module.id tanto para "module" como para "item" para mantener la estructura de ids
          Object.keys(actionsObj).forEach(action => {
            actionsObj[action] && ids.push(`${role.id}-${module.id}-${module.id}-${action}`)
          })
        }

        // Permisos a nivel de módulo (si existen)
        module.actions &&
          Object.keys(module.actions).forEach(action => module.actions[action] && ids.push(`${role.id}-${action}`))
      })
    })

    return ids
  }, [roleModules])

  // const totalActionsCount = allActionIds.length

  const togglePermission = (id: string) => {
    setSelectedCheckbox(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  useEffect(() => {
    setSelectedCheckbox(allActionIds)
  }, [allActionIds])

  /* const handleSelectAllCheckbox = () => {
    if (selectedCheckbox.length === totalActionsCount) {
      setSelectedCheckbox([])

      return
    }

    setSelectedCheckbox(allActionIds)
  } */

  const methods = useForm({
    defaultValues: defaultValues ?? defaultRoleValues
  })

  useEffect(() => {
    if (defaultValues) {
      methods.reset(defaultValues ?? defaultRoleValues)
    }
  }, [defaultValues, methods])

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = methods

  const handleOnSubmit = async (values: any) => {
    const permissions = selectedCheckbox.reduce(
      (acc, id) => {
        const [, , itemId, action] = id.split('-')

        if (!acc[itemId]) {
          acc[itemId] = {
            module: {
              id: Number(itemId)
            },
            privileges: {
              read: false,
              create: false,
              update: false,
              delete: false
            }
          }
        }

        acc[itemId].privileges[action] = true

        return acc
      },
      {} as Record<
        string,
        {
          module: { id: number }
          privileges: Record<string, boolean>
        }
      >
    )

    await mutate({
      roleName: values.name,
      modulePrivileges: Object.values(permissions)
    })

    reset()

    setSelectedCheckbox([])
  }

  return (
    <CustomDialog
      open={open}
      toogleDialog={toogleDialog}
      title={defaultValues ? 'Editar Rol' : 'Crear Rol'}
      maxWidth='lg'
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Box mb={4}>
            <CustomTextField
              {...register('name')}
              autoFocus
              fullWidth
              label='Rol'
              placeholder='Ingrese el nombre del rol'
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>

          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: '5px !important' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        whiteSpace: 'nowrap',
                        alignItems: 'center',
                        textTransform: 'capitalize',
                        '& svg': { ml: 1, cursor: 'pointer' },
                        color: theme => theme.palette.text.secondary,
                        fontSize: theme => theme.typography.h6.fontSize
                      }}
                    >
                      Módulos
                      <Tooltip placement='top' title='Permitir o denegar todos los permisos'>
                        <Box sx={{ display: 'flex' }}>
                          <Icon icon='tabler:info-circle' fontSize='1.25rem' />
                        </Box>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        textTransform: 'capitalize',
                        color: theme => theme.palette.text.secondary,
                        fontSize: theme => theme.typography.h6.fontSize
                      }}
                    >
                      Leer
                    </Box>
                    {/*<FormControlLabel
                      label='Read'
                      sx={{ '& .MuiTypography-root': { textTransform: 'capitalize', color: 'text.secondary' } }}
                      control={
                        <Checkbox
                          size='small'
                          onChange={handleSelectAllCheckbox}
                          indeterminate={selectedCheckbox.length > 0 && selectedCheckbox.length < totalActionsCount}
                          checked={selectedCheckbox.length === totalActionsCount && totalActionsCount > 0}
                        />
                      }
                    />*/}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        textTransform: 'capitalize',
                        color: theme => theme.palette.text.secondary,
                        fontSize: theme => theme.typography.h6.fontSize
                      }}
                    >
                      Crear
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        textTransform: 'capitalize',
                        color: theme => theme.palette.text.secondary,
                        fontSize: theme => theme.typography.h6.fontSize
                      }}
                    >
                      Editar
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        textTransform: 'capitalize',
                        color: theme => theme.palette.text.secondary,
                        fontSize: theme => theme.typography.h6.fontSize
                      }}
                    >
                      Eliminar
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoadingQuery && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Loader type='component' />
                    </TableCell>
                  </TableRow>
                )}

                {roleModules?.map((role, rIndex) => {
                  return (
                    <Fragment key={role.id ?? rIndex}>
                      {/* fila header del role */}
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            pl: '5px !important',
                            fontWeight: 700,
                            backgroundColor: theme => theme.palette.action.hover,
                            textTransform: 'capitalize'
                          }}
                        >
                          {role.name}
                        </TableCell>
                      </TableRow>

                      {/* módulos (children) del role */}
                      {role.children?.map((module: any) => (
                        <Fragment key={`${role.id}-${module.id}`}>
                          {/* Si el módulo no tiene children, renderizarlo como fila (item) */}
                          {!module.children || module.children.length === 0 ? (
                            <TableRow key={`${role.id}-${module.id}-${module.id}`}>
                              <TableCell
                                sx={{
                                  pl: '20px !important',
                                  fontWeight: 600,
                                  backgroundColor: theme => theme.palette.action.selected,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {module.name}
                              </TableCell>

                              {(() => {
                                const actionsObj = module.actions ?? {
                                  read: false,
                                  create: false,
                                  update: false,
                                  delete: false
                                }

                                const actionKeys = Object.keys(actionsObj)

                                return actionKeys.map((action: string) => {
                                  const cbId = `${role.id}-${module.id}-${module.id}-${action}`

                                  return (
                                    <TableCell
                                      key={cbId}
                                      sx={{
                                        backgroundColor: theme => theme.palette.action.selected
                                      }}
                                    >
                                      <FormControlLabel
                                        label={''}
                                        sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
                                        control={
                                          <Checkbox
                                            size='small'
                                            id={cbId}
                                            onChange={() => togglePermission(cbId)}
                                            checked={selectedCheckbox.includes(cbId)}
                                          />
                                        }
                                      />
                                    </TableCell>
                                  )
                                })
                              })()}
                            </TableRow>
                          ) : (
                            <>
                              {/* fila header del módulo */}
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  sx={{
                                    pl: '20px !important',
                                    fontWeight: 600,
                                    backgroundColor: theme => theme.palette.action.selected,
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {module.name}
                                </TableCell>
                              </TableRow>

                              {/* items/submódulos del módulo */}
                              {module.children?.map((item: any) => {
                                const actionsObj = item.actions ?? {
                                  read: false,
                                  create: false,
                                  update: false,
                                  delete: false
                                }

                                const actionKeys = Object.keys(actionsObj)

                                return (
                                  <TableRow key={`${role.id}-${module.id}-${item.id}`}>
                                    <TableCell
                                      sx={{
                                        pl: '40px !important',
                                        backgroundColor: theme => theme.palette.action.hover,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {item.name}
                                    </TableCell>

                                    {actionKeys.map((action: string) => {
                                      const cbId = `${role.id}-${module.id}-${item.id}-${action}`

                                      return (
                                        <TableCell
                                          key={cbId}
                                          sx={{ backgroundColor: theme => theme.palette.action.hover }}
                                        >
                                          <FormControlLabel
                                            label={''}
                                            sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
                                            control={
                                              <Checkbox
                                                size='small'
                                                id={cbId}
                                                onChange={() => togglePermission(cbId)}
                                                checked={selectedCheckbox.includes(cbId)}
                                              />
                                            }
                                          />
                                        </TableCell>
                                      )
                                    })}
                                  </TableRow>
                                )
                              })}
                            </>
                          )}
                        </Fragment>
                      ))}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display='flex' justifyContent='center' mt={4}>
            <CustomButton type='submit' variant='contained' isLoading={isLoadingMutate} text='Guardar' />
          </Box>
        </form>
      </FormProvider>
    </CustomDialog>
  )
}

export default Form
