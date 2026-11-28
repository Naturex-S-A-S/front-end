"use client";
import { useEffect } from "react";

import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";

import { Checkbox, FormControlLabel, Grid } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import { mockUnitWeight } from "@/utils/mocks";
import usePatchFeedstock from "@/hooks/feedstock/usePatchFeedstock";
import type { IFeedstock } from "@/hooks/feedstock/useGetFeedstockById";
import Category from "../../../../../../@core/components/inventory/category";
import Providers from "../../../../../../@core/components/inventory/providers";
import useGetCategory from "@/hooks/feedstock/useGetCategory";

interface Props {
  feedstock: IFeedstock;
}

const Detail: React.FC<Props> = ({ feedstock }) => {
  const { mutate, isPending } = usePatchFeedstock();
  const { categories } = useGetCategory();

  const methods = useForm({
    defaultValues: {
      name: feedstock.name,
      allergen: feedstock.allergen,
      measureUnit: {
        label: "Gramo",
        value: "g"
      },

      // Lo disponible son los lotes no vencidos; lo vencido se muestra aparte (D16).
      quantity: feedstock.availableQuantityG,
      charge: feedstock.availableChargeG,
      total: feedstock.availableCharge,
      expiredQuantity: feedstock.expiredQuantityG,
      expiredTotal: feedstock.expiredCharge,
      minimumStandard: feedstock.minimumStandard,
      category:
        Array.isArray(feedstock.categories) && feedstock.categories.length > 0 ? feedstock.categories[0] : undefined,
      provider:
        Array.isArray(feedstock.providers) && feedstock.providers.length > 0 ? feedstock.providers[0] : undefined
    }
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue
  } = methods;

  const onSubmit = (values: any) => {
    const req = {
      name: values.name,
      allergen: values.allergen
    };

    mutate({
      id: feedstock.id,
      data: req
    });
  };

  const updateCategories = (newCategories: any) => {
    mutate({
      id: feedstock.id,
      data: {
        category: newCategories
      }
    });
  };

  const measureUnitWatch = useWatch({
    control,
    name: "measureUnit"
  });

  useEffect(() => {
    if (measureUnitWatch) {
      switch (measureUnitWatch.value) {
        case "g":
          setValue("quantity", feedstock.availableQuantityG);
          setValue("charge", feedstock.availableChargeG);
          setValue("expiredQuantity", feedstock.expiredQuantityG);
          break;
        case "kg":
          setValue("quantity", feedstock.availableQuantityK);
          setValue("charge", feedstock.availableChargeKg);
          setValue("expiredQuantity", feedstock.expiredQuantityK);
          break;
        case "t":
          setValue("quantity", feedstock.availableQuantityT);
          setValue("charge", feedstock.availableChargeT);
          setValue("expiredQuantity", feedstock.expiredQuantityT);
          break;
      }
    }
  }, [
    feedstock.availableChargeG,
    feedstock.availableChargeKg,
    feedstock.availableChargeT,
    feedstock.availableQuantityG,
    feedstock.availableQuantityK,
    feedstock.availableQuantityT,
    feedstock.expiredQuantityG,
    feedstock.expiredQuantityK,
    feedstock.expiredQuantityT,
    measureUnitWatch,
    setValue
  ]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={8}>
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
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("minimumStandard")}
                    disabled
                    fullWidth
                    type='number'
                    label='Stock mínimo'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Controller
                    name='measureUnit'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={mockUnitWeight}
                        onChange={(e, value: any) => {
                          onChange(value);
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Unidad de medida'
                            placeholder='Seleccione una unidad de medida'
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("quantity")}
                    disabled
                    fullWidth
                    type='number'
                    label='Cantidad disponible'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("charge")}
                    disabled
                    fullWidth
                    type='number'
                    label='Valor unitario'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("total")}
                    disabled
                    fullWidth
                    type='number'
                    label='Valor total'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("expiredQuantity")}
                    disabled
                    fullWidth
                    type='number'
                    label='Cantidad vencida'
                    placeholder=''
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <CustomTextField
                    {...register("expiredTotal")}
                    disabled
                    fullWidth
                    type='number'
                    label='Valor vencido'
                    placeholder=''
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <Controller
                    name='allergen'
                    control={control}
                    render={({ field: { value } }: any) => (
                      <FormControlLabel
                        control={<Checkbox {...register("allergen")} checked={value} />}
                        label='Alérgeno'
                      />
                    )}
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

      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Category data={feedstock.categories} list={categories} update={updateCategories} isPending={isPending} />
          </Grid>

          <Grid item xs={12}>
            <Providers
              data={feedstock.providers}
              itemId={feedstock.id}
              type='feedstock'
              currentProviderId={feedstock.defaultProviderId}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Detail;
