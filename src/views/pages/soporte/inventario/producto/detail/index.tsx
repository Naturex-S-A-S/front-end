import { useEffect, useState } from "react";

import { Grid, IconButton } from "@mui/material";

import { Controller, FormProvider, useForm } from "react-hook-form";

import { Icon } from "@iconify/react";

import { yupResolver } from "@hookform/resolvers/yup";

import CustomButton from "@/@core/components/mui/Button";
import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import type { IProduct } from "@/types/pages/product";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import useGetProductUnit from "@/hooks/product/useGetProductUnit";
import usePutProduct from "@/hooks/product/usePatchProduct";
import History from "./history";
import FormulationsList from "./formulationsList";
import PackagingsList from "./packagingsList";
import EditPackagingsDialog from "./editPackagingsDialog";
import { useAbility } from "@/hooks/casl/useAbility";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { updateProductSchema } from "@/utils/schemas/inventory/product";
import Categories from "@/@core/components/inventory/categories";
import useGetCategory from "@/hooks/product/useGetCategory";

interface IProps {
  product: IProduct;
}

const Detail: React.FC<IProps> = ({ product }) => {
  const [openEditPackagings, setOpenEditPackagings] = useState(false);
  const { categories } = useGetCategory();
  const { units } = useGetProductUnit();
  const { mutate, isPending } = usePutProduct();
  const ability = useAbility();

  const canReadFormulation = ability.can(
    ABILITY_ACTIONS.READ as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.FORMULATION
  );

  const methods = useForm({
    defaultValues: {
      name: undefined,
      measurement: undefined,
      unit: undefined,
      minimumStandard: undefined
    },
    mode: "onChange",
    resolver: yupResolver(updateProductSchema)
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    reset
  } = methods;

  useEffect(() => {
    if (!product || !units?.length) return;

    reset({
      name: product.name ?? "",
      measurement: product.measurement ?? 0,
      unit: units.find((u: any) => u.id === product.unit) ?? undefined,
      minimumStandard: product.minimumStandard ?? undefined
    });
  }, [product, units, reset]);

  const updateCategories = (newCategories: any) => {
    mutate({
      id: product.id,
      data: {
        category: newCategories
      }
    });
  };

  const onSubmit = (values: any) => {
    mutate({
      id: product.id,
      data: {
        name: values.name,
        measurement: Number(values.measurement),
        unit: values.unit.id,
        minimumStandard: Number(values.minimumStandard)
      }
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <CustomCard title='Información'>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("name")}
                    fullWidth
                    label='Nombre'
                    placeholder='Ingrese el nombre'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <CustomTextField
                    {...register("measurement")}
                    fullWidth
                    label='Medida'
                    placeholder='Ingrese la medida'
                    error={!!errors.measurement}
                    helperText={errors.measurement?.message}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Controller
                    name='unit'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={units ?? []}
                        onChange={(e, value: any) => {
                          onChange(value);
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Unidad'
                            placeholder='Seleccione una unidad'
                            error={!!errors.unit}

                            // helperText={errors.unit?.value?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <CustomTextField
                    {...register("minimumStandard")}
                    fullWidth
                    type='number'
                    label='Stock mínimo'
                    placeholder=''
                  />
                </Grid>

                <Grid item xs={12} className='flex justify-center'>
                  <CustomButton text='Actualizar' type='submit' isLoading={isPending} />
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </CustomCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Categories data={product.categories} list={categories} update={updateCategories} isPending={isPending} />
      </Grid>
      <Grid item xs={12}>
        <CustomCard title='Historial'>
          <History list={product.productHistory ?? []} />
        </CustomCard>
      </Grid>
      <Grid item xs={12}>
        <CustomCard
          title='Materiales de empaque'
          action={
            product.packagings?.length > 0 && (
              <IconButton onClick={() => setOpenEditPackagings(true)}>
                <Icon icon='mdi:pencil' />
              </IconButton>
            )
          }
        >
          <PackagingsList list={product.packagings ?? []} />
        </CustomCard>
      </Grid>
      <EditPackagingsDialog
        productId={product.id}
        productName={product.name}
        packagings={product.packagings ?? []}
        open={openEditPackagings}
        toogleDialog={() => setOpenEditPackagings(!openEditPackagings)}
      />
      {canReadFormulation && (
        <Grid item xs={12}>
          <CustomCard title='Fórmulas'>
            <FormulationsList productId={product.id} />
          </CustomCard>
        </Grid>
      )}
    </Grid>
  );
};

export default Detail;
