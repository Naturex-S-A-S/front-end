import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Grid } from "@mui/material";

import { Controller, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import type { IOrderDetail, IOrderItem, IOrderKardex } from "@/types/pages/order";
import CreateButton from "@/components/layout/shared/CreateButton";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import { adjustmentMaterialSchema, adjustmentProductSchema, categoryOnlySchema } from "@/utils/schemas/order";
import AdjustmentList from "./adjustmentList";
import MaterialFormFields from "./MaterialFormFields";
import ProductFormFields from "./ProductFormFields";
import { useAdjustmentMutations } from "./useAdjustmentMutations";
import useGetWarehouseList from "@/hooks/warehouse/useGetWarehouse";
import CustomCard from "@/@core/components/mui/Card";

type Option = { id: number; label: string };

export interface AdjustmentFormValues {
  category?: Option | null;
  material?: Option | null;
  product?: Option | null;
  type?: string | null;
  charge?: string | null;
  quantity?: number | null;
  observation?: string | null;
  classification?: string | null;
  batch?: string | null;
  rack?: { id: string } | null;
  expiration_date_1?: string | null;
  expiration_date_2?: string | null;
}

interface IProps {
  materials: IOrderDetail[];
  products: IOrderItem[];
  kardex: IOrderKardex[];
  batch: string;
  orderId: number;
  canCreate: boolean;
}

const Adjustment: FC<IProps> = ({ materials, products, kardex, batch, orderId, canCreate }) => {
  const [open, setOpen] = useState(false);

  const { warehouseList } = useGetWarehouseList();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<AdjustmentFormValues>({
    defaultValues: {
      category: undefined,
      material: null,
      product: null,
      type: null,
      charge: "",
      quantity: null,
      observation: "",
      classification: "",
      batch: "",
      rack: null,
      expiration_date_1: "",
      expiration_date_2: ""
    },
    resolver: async (data, context, options) => {
      const catId = data.category?.id;

      const schema =
        (catId === 1 || catId === 2) ? adjustmentMaterialSchema : catId === 3 ? adjustmentProductSchema : categoryOnlySchema;

      return yupResolver(schema)(data as any, context, options as any);
    }
  });

  const toogleDialog = () => {
    setOpen(!open);
  };

  const categoryWatch: any = watch("category");

  const isCategoryProduct = categoryWatch?.id === 3;
  const isCategoryMaterial = (categoryWatch?.id === 2);
  const isCategoryPackaging = (categoryWatch?.id === 1);

  const materialOptions = useMemo(() => {
    return materials.filter((material) => material.typeMaterial === (isCategoryPackaging ? "packaging" : "materia_prima")).map((material) => ({
      id: material.idMaterial,
      label: material.nameMaterial,
      type: material.typeMaterial
    }));
  }, [materials, isCategoryPackaging]);

  const productOptions = products.map((product: any) => ({
    id: product.finalProduct.id,
    label: `${product.finalProduct.name} ${product.finalProduct.measurement}${product.finalProduct.unit}`
  }));

  const handleOnReset = useCallback(
    (value?: any) => {
      reset({
        category: value,
        material: null,
        product: null,
        type: null,
        charge: "",
        quantity: null,
        observation: "",
        classification: "",
        batch,
        rack: null,
        expiration_date_1: "",
        expiration_date_2: ""
      });
    },
    [reset, batch]
  );

  const { submitAdjustment, isPending } = useAdjustmentMutations({
    orderId,
    isCategoryMaterial,
    isCategoryPackaging,
    isCategoryProduct,
    onReset: handleOnReset,
    onClose: toogleDialog
  });

  useEffect(() => {
    handleOnReset();
  }, [batch, handleOnReset]);

  const handleOnChangeCategory = (_: any, value: any) => {
    handleOnReset(value);
  };

  return (
    <CustomCard title={"Ajustes"}>
      {canCreate && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CreateButton onClick={toogleDialog} />
        </Box>
      )}
      <CustomDialog open={open} toogleDialog={toogleDialog} title='Realizar Ajuste'>
        <form onSubmit={handleSubmit(submitAdjustment)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                rules={{ required: "Seleccione una categoría" }}
                render={({ field: { value }, fieldState: { error } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={[
                      { id: 1, label: "Material de empaque" },
                      { id: 2, label: "Materia prima" },
                      { id: 3, label: "Producto" }
                    ]}
                    onChange={handleOnChangeCategory}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Categoria'
                        placeholder='Seleccione una categoria'
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {(isCategoryMaterial || isCategoryPackaging) && (
              <MaterialFormFields
                control={control}
                errors={errors}
                materialOptions={materialOptions}
                warehouseList={warehouseList}
              />
            )}

            {isCategoryProduct && (
              <ProductFormFields
                control={control}
                errors={errors}
                productOptions={productOptions}
                warehouseList={warehouseList}
              />
            )}

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <CustomButton type='submit' disabled={isPending} isLoading={isPending}>
                Guardar
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </CustomDialog>
      <AdjustmentList data={kardex} isLoading={false} />
    </CustomCard>
  );
};

export default Adjustment;
