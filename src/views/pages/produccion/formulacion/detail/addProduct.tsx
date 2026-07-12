import { Grid } from "@mui/material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";

import { postProductsToFormulation } from "@/api/formulation";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomTextField from "@/@core/components/mui/TextField";
import useGetProductList from "@/hooks/product/useGetProductList";

const schema = yup.object().shape({
  product: yup.array().min(1, "Seleccione al menos un producto").required("Seleccione al menos un producto")
});

type AddProductProps = {
  open: boolean;
  toogleDialog: () => void;
  formulationId: number;
};

const AddProduct = ({ open, toogleDialog, formulationId }: AddProductProps) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  const { productList } = useGetProductList();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { products: string[] }) => postProductsToFormulation(formulationId, data),
    onSuccess: () => {
      toast.success("Producto agregado con éxito");
      queryClient.invalidateQueries({
        queryKey: ["getFormulationById", formulationId]
      });
      reset();
      toogleDialog();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al agregar el producto");
    }
  });

  const handleAdd = (data: any) => {
    mutate({ products: data.product.map((product: any) => product.id) });
  };

  return (
    <CustomDialog open={open} toogleDialog={toogleDialog} title='Agregar Producto' maxWidth='xs'>
      <form onSubmit={handleSubmit(handleAdd)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name='product'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  multiple
                  options={productList}
                  getOptionLabel={(option: any) => option?.fullName || option?.name || ""}
                  onChange={(e, value: any) => {
                    onChange(value);
                  }}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Producto'
                      placeholder='Seleccione un producto'
                      error={!!errors.product}
                      helperText={errors.product?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} display={"flex"} justifyContent={"center"}>
            <CustomButton size='small' type='submit' isLoading={isPending}>
              Agregar
            </CustomButton>
          </Grid>
        </Grid>
      </form>
    </CustomDialog>
  );
};

export default AddProduct;
