import { Grid } from '@mui/material'

import { useFormContext } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { documentTypeOptions } from '@/utils/data'
import CustomButton from '@/@core/components/mui/Button'
import TextFieldPassword from '@/components/layout/shared/TextFieldPassword'

type Props = {
  isPending: boolean
  isEdit?: boolean
}

const Form: React.FC<Props> = ({ isPending, isEdit = false }) => {
  const {
    register,
    formState: { errors, defaultValues },
    setValue
  }: any = useFormContext()

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              {...register('dniType')}
              disabled={isEdit}
              defaultValue={isEdit ? defaultValues.dniType : null}
              options={documentTypeOptions}
              onChange={(e, value: any) => {
                if (!value) return

                setValue('dniType', {
                  value: value.value
                })
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Tipo de documento'
                  placeholder='Seleccione un tipo de documento'
                  error={!!errors.dniType}
                  helperText={errors.dniType?.value?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              {...register('dni')}
              disabled={isEdit}
              autoFocus
              fullWidth
              label='Documento de identidad'
              placeholder='Ingrese su documento de identidad'
              error={!!errors.dni}
              helperText={errors.dni?.message}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          {...register('name')}
          autoFocus
          fullWidth
          label='Nombres'
          placeholder='Ingrese sus nombres'
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomTextField
          {...register('lastName')}
          autoFocus
          fullWidth
          label='Apellidos'
          placeholder='Ingrese sus apellidos'
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomTextField
          {...register('email')}
          autoFocus
          fullWidth
          label='Correo'
          placeholder='Ingrese su correo'
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomTextField
          {...register('address')}
          autoFocus
          fullWidth
          label='Direccion'
          placeholder='Ingrese su direccion'
          error={!!errors.address}
          helperText={errors.address?.message}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomTextField
          {...register('phone')}
          autoFocus
          fullWidth
          label='Telefono'
          placeholder='Ingrese su telefono'
          error={!!errors.phone}
          helperText={errors.phone?.message}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomAutocomplete
          {...register('roleId')}
          options={[
            {
              value: 27,
              label: 'Administrador'
            },
            {
              value: 2,
              label: 'Soporte'
            }
          ]}
          onChange={(e, value: any) => {
            if (!value) return

            setValue('roleId', {
              value: value.value
            })
          }}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Rol'
              placeholder='Seleccione un rol'
              error={!!errors.roleId}
              helperText={errors.roleId?.value?.message}
            />
          )}
        />
      </Grid>

      {!isEdit && (
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TextFieldPassword register={register} errors={errors} name='password' label='Contraseña' />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextFieldPassword
                register={register}
                errors={errors}
                name='confirmPassword'
                label='Confirmar Contraseña'
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  )
}

export default Form
