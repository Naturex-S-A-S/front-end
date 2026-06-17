import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";

interface Props {
  isPending: boolean;
}

const Form = ({ isPending }: Props) => {
  const {
    register,
    formState: { errors }
  }: any = useFormContext();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message as string}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("address")}
          fullWidth
          label='Dirección'
          placeholder='Ingrese la dirección'
          error={!!errors.address}
          helperText={errors.address?.message as string}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("phone")}
          fullWidth
          label='Teléfono'
          placeholder='Ingrese el teléfono'
          error={!!errors.phone}
          helperText={errors.phone?.message as string}
        />
      </Grid>
      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
