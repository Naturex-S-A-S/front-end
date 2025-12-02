import { useState } from 'react'

import { IconButton, InputAdornment } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

type Props = {
  register: any
  errors: any
  name: string
  label: string
}

const TextFieldPassword: React.FC<Props> = ({ register, errors, name, label }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  return (
    <CustomTextField
      {...register(name)}
      fullWidth
      label={label}
      placeholder='············'
      id='outlined-adornment-password'
      type={isPasswordShown ? 'text' : 'password'}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
              <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  )
}

export default TextFieldPassword
