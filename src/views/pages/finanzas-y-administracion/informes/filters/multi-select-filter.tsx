"use client";

import { Controller, useFormContext } from "react-hook-form";

import { TextField } from "@mui/material";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import type { IReportOption } from "@/types/pages/reports";

import type { FilterFormValues } from "./types";

type MultiSelectField = "productIds" | "lineIds" | "categoryIds" | "providerIds" | "cifTypeIds";

interface Props {
  name: MultiSelectField;
  label: string;
  options: IReportOption[];
  numeric?: boolean;
  disabled?: boolean;
}

export default function MultiSelectFilter({ name, label, options, numeric = false, disabled = false }: Props) {
  const { control } = useFormContext<FilterFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const ids: Array<string | number> = Array.isArray(field.value) ? field.value : [];

        const selected = ids.map(
          id => options.find(option => String(option.id) === String(id)) ?? { id, name: String(id) }
        );

        return (
          <CustomAutocomplete
            multiple
            fullWidth
            size='small'
            disabled={disabled}
            options={options}
            value={selected}
            limitTags={2}
            disableCloseOnSelect
            filterSelectedOptions
            noOptionsText='Sin opciones'
            onChange={(_event: unknown, value: IReportOption[]) => {
              const nextIds = value.map(option => option.id);

              field.onChange(numeric ? nextIds.map(Number).filter(Number.isFinite) : nextIds.map(String));
            }}
            renderInput={(params: any) => <TextField {...params} label={label} placeholder={label} size='small' />}
          />
        );
      }}
    />
  );
}
