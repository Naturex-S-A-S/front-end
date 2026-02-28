import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'

import moment from 'moment'

import type { StepIconProps } from '@mui/material'
import { Badge, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

import { Icon } from '@iconify/react'

import Swal from 'sweetalert2'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import type { IVersion } from '@/types/pages/formulation'
import CustomButton from '@/@core/components/mui/Button'
import { useSettings } from '@/@core/hooks/useSettings'
import { putActivateFormulationVersion } from '@/api/formulation'
import CreateVersion from './createVersion'

interface Props {
  formulationId: number
  data?: IVersion[]
  isDetail?: boolean
}

const StepIcon = (props: StepIconProps & { sequentialNumber: number }) => {
  const { active, sequentialNumber } = props

  return (
    <span className='flex items-center mx-3'>
      <Badge badgeContent={`v${sequentialNumber}`} color={active ? 'primary' : 'secondary'} />
    </span>
  )
}

const Versions: React.FC<Props> = ({ data, formulationId, isDetail = true }) => {
  const [activeStep, setActiveStep] = useState(0)

  const queryClient = useQueryClient()
  const { settings } = useSettings()

  useEffect(() => {
    if (data && data.length > 0) {
      const activeVersionIndex = data.findIndex(version => version.active)

      if (activeVersionIndex !== -1) {
        setActiveStep(activeVersionIndex)
      }
    }
  }, [data])

  const { mutate: activateVersion, isPending } = useMutation({
    mutationFn: ({ formulationId, idVersion }: { formulationId: number; idVersion: number }) =>
      putActivateFormulationVersion(formulationId, idVersion),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getFormulationById', formulationId]
      })
      toast.success('Versión activada con éxito')
    },
    onError: () => {
      toast.error('No se pudo activar la versión')
    }
  })

  const handleShow = (index: number) => {
    setActiveStep(index)
  }

  const handleActivate = (version: number) => {
    Swal.fire({
      title: `Activar versión ${version}`,
      text: 'Estas a punto de cambiar la versión activa de la formulación. El producto se actualizará a esta versión.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#009541',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      theme: settings.mode === 'dark' ? 'dark' : 'light',
      background: settings.mode === 'dark' ? '#2f3349' : '#ffffff'
    }).then(result => {
      if (result.isConfirmed) {
        activateVersion({ formulationId, idVersion: version })
      }
    })
  }

  if (!data || data.length === 0) {
    return <Box>No hay versiones disponibles</Box>
  }

  return (
    <Box display='flex' flexDirection={'column'} alignItems={'center'}>
      {isDetail && <CreateVersion formulationId={formulationId} />}
      <Stepper activeStep={activeStep} orientation='vertical' className='w-full'>
        {data.map((step, index) => (
          <Step key={step.id} onClick={() => handleShow(index)}>
            <StepLabel
              StepIconComponent={(props: StepIconProps) => (
                <StepIcon {...props} sequentialNumber={step.sequentialNumber} />
              )}
            >
              <Box display='flex' justifyContent='space-between'>
                <Box gap={2} display='flex' alignItems='center'>
                  Versión {step.sequentialNumber}{' '}
                  {step.active && <Chip label={'Actual'} color='primary' size='small' />}
                </Box>
                {isDetail && (
                  <div>{step?.dateCreated && moment(step.dateCreated).format('DD MMM YYYY, h:mm:ss a')}</div>
                )}
              </Box>
              <div>{step.comment}</div>
              {activeStep !== index && <span className='cursor-pointer text-blue-500'>Ver detalle</span>}
            </StepLabel>
            <StepContent>
              <Box>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography component='span' variant='subtitle2'>
                    Detalle de la versión {step.sequentialNumber}
                  </Typography>
                  {isDetail && !step.active && (
                    <CustomButton
                      variant='outlined'
                      size='small'
                      className='flex items-center'
                      startIcon={<Icon icon='mdi:reload' width={18} />}
                      isLoading={isPending}
                      onClick={() => handleActivate(step.sequentialNumber)}
                    >
                      Activar esta versión
                    </CustomButton>
                  )}
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Cantidad (g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {step.details &&
                      step.details.map(detail => (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.material.name || 'Sin nombre'}</TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}

export default Versions
