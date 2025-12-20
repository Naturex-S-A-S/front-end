/* eslint-disable import/no-named-as-default */
import React from 'react'

import DatePicker from 'react-datepicker'

import { Controller } from 'react-hook-form'

import DatePickerWrapper from '@/@core/styles/libs/react-datepicker'
import CustomTextField from '../mui/TextField'

interface Props {
  control: any
  errors?: any
  minDate?: any
}

const CustomDatePicker: React.FC<Props> = ({ control, errors, minDate }) => {
  return (
    <DatePickerWrapper>
      <Controller
        name='expirationDate1'
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <DatePicker
            selected={value}
            showYearDropdown
            showMonthDropdown
            onChange={(e: any) => onChange(e)}
            placeholderText='YYYY-MM-DD'
            dateFormat={'yyyy-MM-dd'}
            minDate={minDate}
            customInput={
              <CustomTextField
                value={value}
                onChange={onChange}
                label='Fecha de expiración'
                error={Boolean(errors)}
                aria-describedby='validation-basic-expirationDate1'
                {...(errors && { helperText: 'This field is required' })}
              />
            }
          />
        )}
      />
    </DatePickerWrapper>
  )
}

export default CustomDatePicker
