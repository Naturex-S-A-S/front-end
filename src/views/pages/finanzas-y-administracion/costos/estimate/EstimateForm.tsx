"use client";

import { Box, Grid } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import type { ProductOption } from "../../../../../hooks/costs/useEstimate";
import type { IProduct } from "@/types/pages/product";

interface Props {
  productList: IProduct[] | undefined;
  selectedProduct: ProductOption | null;
  quantityKg?: number;
  error: string | null;
  isEstimating?: boolean;
  isTestProduct?: boolean;
  units?: number | string;
  unitGramsFinalProduct?: number | string;
  isEstimatingDummy?: boolean;
  onProductChange: (product: ProductOption | null) => void;
  onQuantityChange?: (quantity: number) => void;
  onUnitsChange?: (value: number | string) => void;
  onGramsChange?: (value: number | string) => void;
  onEstimate?: () => void;
}

const EstimateForm = ({
  productList,
  selectedProduct,
  error,
  onProductChange,
  isTestProduct,
  units,
  unitGramsFinalProduct,
  isEstimatingDummy,
  onUnitsChange,
  onGramsChange
}: Props) => {
  return (
    <CustomCard
      title={
        <Box display='flex' alignItems='center' gap={2}>
          <Icon icon='mdi:calculator-variant-outline' fontSize={20} />
          <span>Estimación de Costos</span>
        </Box>
      }
    >
      <Grid container spacing={4} alignItems='flex-end'>
        <Grid item xs={12} sm={6} md={4}>
          <CustomAutocomplete
            value={selectedProduct}
            options={productList || []}
            getOptionLabel={(option: ProductOption) => option?.fullName || option?.name || ""}
            onChange={(_: any, v: ProductOption | null) => onProductChange(v)}
            renderInput={(params: any) => (
              <CustomTextField
                {...params}
                label='Producto'
                placeholder='Seleccione un producto'
                error={!!error && !selectedProduct}
              />
            )}
          />
        </Grid>

        {isTestProduct && (
          <>
            <Grid item xs={6} sm={3} md={2}>
              <CustomTextField
                label='Unidades'
                type='number'
                placeholder='Ej: 100'
                value={units ?? ''}
                onChange={e => onUnitsChange?.(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isEstimatingDummy}
                inputProps={{ min: 0, step: 'any' }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <CustomTextField
                label='Gramos por unidad de producto final'
                type='number'
                placeholder='Ej: 250'
                value={unitGramsFinalProduct ?? ''}
                onChange={e => onGramsChange?.(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isEstimatingDummy}
                inputProps={{ min: 0, step: 'any' }}
              />
            </Grid>
          </>
        )}
        {/*<Grid item xs={6} sm={3} md={2}>
          <CustomTextField
            label='Unidades'
            type='number'
            placeholder='Ej: 100'
            value={quantityKg}
            onChange={e => onQuantityChange(Number(e.target.value))}
            error={!!error && (!quantityKg || quantityKg <= 0)}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <CustomButton
            onClick={onEstimate}
            isLoading={isEstimating}
            disabled={!selectedProduct || !quantityKg}
            startIcon={<Icon icon='mdi:calculator' />}
          >
            Estimar
          </CustomButton>
        </Grid>*/}
      </Grid>
    </CustomCard>
  );
};

export default EstimateForm;
