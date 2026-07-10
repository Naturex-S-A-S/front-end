/* eslint-disable import/no-named-as-default */
import React from "react";

import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

import { Controller } from "react-hook-form";

import DatePickerWrapper from "@/@core/styles/libs/react-datepicker";
import CustomTextField from "../mui/TextField";

registerLocale("es", es);

interface Props {
  control: any;
  errors?: any;
  minDate?: any;
  name: string;
  label: string;
}

const CustomDatePicker: React.FC<Props> = ({ control, errors, minDate, label, name }) => {
  return (
    <DatePickerWrapper>
      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <DatePicker
            selected={value}
            showYearDropdown
            showMonthDropdown
            locale='es'
            onChange={(e: any) => onChange(e)}
            placeholderText='YYYY-MM-DD'
            dateFormat={"yyyy-MM-dd"}
            minDate={minDate}
            className='w-full'
            customInput={
              <CustomTextField
                value={value}
                onChange={onChange}
                label={label}
                error={Boolean(errors)}
                aria-describedby='validation-basic-expirationDate1'
                {...{ helperText: Boolean(errors) ? errors?.message || "This field is required" : "" }}
              />
            }
          />
        )}
      />
    </DatePickerWrapper>
  );
};

export default CustomDatePicker;
