import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";

interface Props {
  isPending: boolean;
  onCancel: () => void;
}

const RackForm = ({ isPending, onCancel }: Props) => {
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
          placeholder='Ingrese el nombre del rack'
          error={!!errors.name}
          helperText={errors.name?.message as string}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("description")}
          fullWidth
          label='Descripción'
          placeholder='Ingrese la descripción'
          error={!!errors.description}
          helperText={errors.description?.message as string}
        />
      </Grid>
      <Grid item xs={12} className='flex justify-center gap-2'>
        <CustomButton text='Cancelar' variant='outlined' onClick={onCancel} />
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default RackForm;
