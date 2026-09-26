import { useEffect, useState, type FC } from "react";

import { Icon } from "@iconify/react";

import { Chip, Grid } from "@mui/material";

import { Controller, useForm } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomCard from "@/@core/components/mui/Card";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";

interface Props {
  data: {
    id: string;
    name: string;
  }[];
  list: {
    id: string;
    name: string;
  }[];
  update: (newCategories: string[]) => void;
  isPending?: boolean;
}

const Category: FC<Props> = ({ data, list, update, isPending }) => {
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<{ category: { id: string; name: string } | null }>({
    defaultValues: {
      category: null
    }
  });

  const toogleDialog = () => setOpen(!open);

  const current = data?.[0];
  const currentInList = list?.find(category => category.id === current?.id) ?? null;

  useEffect(() => {
    if (open) {
      reset({ category: currentInList });
    }
  }, [open, currentInList, reset]);

  const handleChange = (values: any) => {
    update(values.category ? [values.category.id] : []);
    reset();
    toogleDialog();
  };

  return (
    <CustomCard
      title='Categoria'
      action={
        <CustomButton size='small' startIcon={<Icon icon='mdi:pencil' />} onClick={toogleDialog} isLoading={isPending}>
          Cambiar
        </CustomButton>
      }
    >
      {current ? <Chip variant='outlined' label={current.name} /> : <span>Sin categoria</span>}

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Cambiar Categoria' maxWidth='xs'>
        <form onSubmit={handleSubmit(handleChange)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={list}
                    onChange={(e, value: any) => {
                      onChange(value);
                    }}
                    renderInput={params => (
                      <CustomTextField {...params} label='Categoria' placeholder='Seleccione una categoria' />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
              <CustomButton size='small' type='submit'>
                Guardar
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </CustomDialog>
    </CustomCard>
  );
};

export default Category;
