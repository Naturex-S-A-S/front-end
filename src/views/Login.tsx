'use client'

// MUI Imports
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

import toast from 'react-hot-toast'

// Type Imports
import { useForm } from 'react-hook-form'

import { signIn } from 'next-auth/react'

import { yupResolver } from '@hookform/resolvers/yup'

import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { loginSchema } from '@/utils/schemas/login'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { mockDocumentTypes } from '@/utils/mocks'
import CustomButton from '@/@core/components/mui/Button'
import TextFieldPassword from '@/components/layout/shared/TextFieldPassword'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/naturex-logo.avif'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue
  } = useForm({
    defaultValues: {
      documentType: {
        value: undefined
      },
      document: undefined,
      password: undefined
    },
    mode: 'onBlur',
    resolver: yupResolver(loginSchema)
  })

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleOnSubmit = async (values: any) => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') ?? '/'

      const res = await signIn('credentials', {
        document: values.document,
        password: values.password,
        documentType: values.documentType.value,
        redirect: false,
        callbackUrl
      })

      const redirectTo = res?.url ?? (res?.ok ? callbackUrl : null)

      if (redirectTo) {
        router.replace(redirectTo)
      } else {
        toast.error('Credenciales incorrectas', {
          duration: 5000
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Bienvenido a ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Por favor, inicia sesión en tu cuenta</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(handleOnSubmit)} className='flex flex-col gap-5'>
            <CustomAutocomplete
              {...register('documentType')}
              options={mockDocumentTypes}
              onChange={(e, value) => {
                if (!value) return

                setValue('documentType', {
                  value: value.value
                })
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Tipo de documento'
                  placeholder='Seleccione un tipo de documento'
                  error={!!errors.documentType}
                  helperText={errors.documentType?.value?.message}
                />
              )}
            />
            <CustomTextField
              {...register('document')}
              fullWidth
              label='Documento de identidad'
              placeholder='Ingrese su documento de identidad'
              error={!!errors.document}
              helperText={errors.document?.message}
            />

            <TextFieldPassword register={register} errors={errors} name='password' label='Contraseña' />

            {/*<CustomTextField
              fullWidth
              label='Correo electrónico'
              placeholder='Ingrese su correo electrónico'
            />
            */}
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              {/*<FormControlLabel control={<Checkbox />} label='Remember me' />*/}
              <Typography className='text-end' color='primary' component={Link}>
                Recuperar contraseña
              </Typography>
            </div>
            <CustomButton isLoading={isLoading} text='Iniciar sesión' type='submit' />
            {/*<div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>¿No tienes una cuenta?</Typography>
              <Typography component={Link} color='primary'>
                Crear una cuenta
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>or</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-textPrimary' size='small'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-error' size='small'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>*/}
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
