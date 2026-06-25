import { useEffect, useState, useTransition } from "react";

import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { Badge, Box, Card, Chip, FormControlLabel, Grid, MenuItem, Stack, Switch, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomTextField from "@/@core/components/mui/TextField";
import { createCifType, updateCifType } from "@/api/cif/actions";
import { cifTypeSchema } from "@/utils/schemas/cif";
import type { ICifType, IPostCifType } from "@/types/pages/cif";
import CustomIconButton from "@/@core/components/mui/IconButton";
import { usePagination, PaginationBar } from "@/@core/components/pagination";

interface TiposCIFPanelProps {
  data: ICifType[];
}

const TiposCIFPanel = ({ data }: TiposCIFPanelProps) => {
  const [dialogItem, setDialogItem] = useState<ICifType | "create" | null>(null);

  const handleEdit = (item: ICifType) => {
    setDialogItem(item);
  };

  const { paginatedData, page, setPage, pageCount } = usePagination(data, 6);

  return (
    <>
      <CustomCard
        title={
          <Stack direction='row' spacing={4} alignItems='center'>
            <Icon icon='mynaui:label' fontSize={15} />
            <Typography variant='h6' fontWeight={600}>
              Tipos de CIF
            </Typography>
            <Badge badgeContent={data.length} color='secondary' />
          </Stack>
        }
        action={
          <CustomButton size='small' onClick={() => setDialogItem("create")}>
            Agregar
          </CustomButton>
        }
      >
        <Box display='flex' flexDirection='column' gap={2}>
          {paginatedData.map(item => (
            <Card key={item.id} variant='outlined'>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px"
                }}
              >
                <div>
                  <Stack direction='row' spacing={2}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>

                    {!item.active && <Chip label='Inactivo' size='small' variant='outlined' />}
                  </Stack>
                  <Typography variant='subtitle2' component='div' sx={{ color: "text.secondary" }}>
                    {item.costBasis}
                  </Typography>
                </div>
                <CustomIconButton onClick={() => handleEdit(item)}>
                  <Icon icon='mdi:pencil' fontSize={15} />
                </CustomIconButton>
              </Box>
            </Card>
          ))}
        </Box>
        <PaginationBar page={page} count={pageCount} onChange={setPage} />
      </CustomCard>
      {dialogItem && (
        <CifTypeDialog
          open={!!dialogItem}
          toogleDialog={() => setDialogItem(null)}
          item={dialogItem === "create" ? undefined : dialogItem}
        />
      )}
    </>
  );
};

interface DialogProps {
  open: boolean;
  toogleDialog: () => void;
  item?: ICifType;
}

const CifTypeDialog = ({ open, toogleDialog, item }: DialogProps) => {
  const isEdit = !!item;
  const [isPending, startTransition] = useTransition();

  const methods = useForm<IPostCifType>({
    defaultValues: { name: "", costBasis: "fixed", active: true },
    resolver: yupResolver(cifTypeSchema) as any
  });

  const { handleSubmit, reset, control } = methods;

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (item) {
      reset({ name: item.name, costBasis: item.costBasis as IPostCifType["costBasis"], active: item.active });
    } else {
      reset({ name: "", costBasis: "fixed", active: true });
    }
  }, [item, reset]);

  const onSubmit = (data: IPostCifType) => {
    startTransition(async () => {
      const result = isEdit && item ? await updateCifType(item.id, data) : await createCifType(data);

      if (result.success) {
        toast.success(isEdit ? "Tipo de CIF actualizado con éxito" : "Tipo de CIF creado con éxito");
        reset();
        toogleDialog();
      } else {
        toast.error(result.error || "Error al guardar el tipo de CIF");
      }
    });
  };

  const handleClose = () => {
    reset();
    toogleDialog();
  };

  return (
    <CustomDialog
      open={open}
      toogleDialog={handleClose}
      title={isEdit ? "Editar Tipo de CIF" : "Agregar Tipo de CIF"}
      maxWidth='xs'
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='Nombre'
                    placeholder='Ingrese el nombre'
                    error={!!methods.formState.errors.name}
                    helperText={methods.formState.errors.name?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='costBasis'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Base de Costo'
                    error={!!methods.formState.errors.costBasis}
                    helperText={methods.formState.errors.costBasis?.message as string}
                  >
                    <MenuItem value='fixed'>Fijo</MenuItem>
                    <MenuItem value='per_kg'>Variable</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Card variant='outlined'>
                <Box
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px" }}
                >
                  <Typography variant='subtitle1'>
                    <Typography variant='body2' fontWeight={"900"}>
                      {active ? "Activo" : "Inactivo"}
                    </Typography>{" "}
                    Solo los tipos activos pueden usarse en períodos.
                  </Typography>
                  <Controller
                    name='active'
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={value} onChange={(e, checked) => onChange(checked)} />}
                        label=''
                      />
                    )}
                  />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} className='flex justify-center'>
              <CustomButton text={isEdit ? "Actualizar" : "Guardar"} type='submit' isLoading={isPending} />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default TiposCIFPanel;
