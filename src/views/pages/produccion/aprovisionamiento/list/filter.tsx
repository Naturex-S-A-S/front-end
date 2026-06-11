"use client";

import { useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useForm, Controller } from "react-hook-form";

import { Grid } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import useGetProductList from "@/hooks/product/useGetProductList";

type Filters = {
  product?: {
    id: number;
    fullName?: string;
  } | null;
  status?: string;
};

const Filter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { control, handleSubmit, reset } = useForm<Filters>({
    defaultValues: { product: null, status: "" }
  });

  const { productList } = useGetProductList();

  const productIdParam = searchParams.get("productId");
  const statusParam = searchParams.get("status") || "";

  useEffect(() => {
    const product =
      productIdParam && productList ? productList.find((p: any) => String(p.id) === productIdParam) ?? null : null;

    product && reset({ product, status: statusParam });
  }, [productIdParam, statusParam, productList, reset]);

  const submit = (data: Filters) => {
    const params = new URLSearchParams();

    if (data?.product?.id) params.set("productId", String(data.product.id));
    if (data?.status) params.set("status", data.status);

    const queryString = params.toString();

    router.replace(`/produccion/aprovisionamiento${queryString ? `?${queryString}` : ""}`);
  };

  const clear = () => {
    reset({ product: null, status: "" });
    router.replace("/produccion/aprovisionamiento");
  };

  return (
    <CustomCard title='Filtros'>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2} alignItems='end'>
          <Grid item xs={12} md={4}>
            <Controller
              name='product'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={productList}
                  getOptionLabel={(option: any) => option?.fullName || ""}
                  onChange={(_, v: any | null) => onChange(v)}
                  renderInput={(params: any) => (
                    <CustomTextField {...params} label='Elegir producto' placeholder='Seleccione un producto' />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={8} display='flex' gap={1} justifyContent='flex-end'>
            <CustomButton type='submit' variant='contained' size='small'>
              Aplicar
            </CustomButton>
            <CustomButton type='button' variant='outlined' size='small' onClick={clear}>
              Limpiar
            </CustomButton>
          </Grid>
        </Grid>
      </form>
    </CustomCard>
  );
};

export default Filter;
