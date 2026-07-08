"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Alert, Box, Divider, FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import CustomCard from "@/@core/components/mui/Card";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import Loader from "@/@core/components/react-spinners";
import useGetProductList from "@/hooks/product/useGetProductList";
import {
  getCostEstimateAction,
  getCurrentPriceAction,
  getPriceHistoryAction,
  getProductSnapshotsAction,
  registerProductPrice,
  saveCostEstimate
} from "@/api/costs/actions";
import CostBreakdown from "./CostBreakdown";
import CurrentPriceCard from "./CurrentPriceCard";
import PriceHistory from "./PriceHistory";
import SnapshotHistory from "./SnapshotHistory";
import SnapshotDetailDialog from "./SnapshotDetailDialog";
import type { ICostEstimate, ICostSnapshotSummary, IProductPrice } from "@/types/pages/costs";
import { TAX_PERCENTAGE } from "@/utils/constant";
import { formatCurrency } from "@/utils/format";

type ProductOption = {
  id: string;
  fullName?: string;
  name?: string;
};

const EstimateView = () => {
  const { productList } = useGetProductList();

  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [quantityKg, setQuantityKg] = useState<number>(1);
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, startEstimateTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const [snapshots, setSnapshots] = useState<ICostSnapshotSummary[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [isLoadingSnapshots, startSnapshotsTransition] = useTransition();

  const [wastePct, setWastePct] = useState<number>(0);
  const [taxPct, setTaxPct] = useState<number>(TAX_PERCENTAGE);
  const [applyTax, setApplyTax] = useState<boolean>(true);

  const [currentPrice, setCurrentPrice] = useState<IProductPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<IProductPrice[]>([]);
  const [lastSavedSnapshotId, setLastSavedSnapshotId] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [priceNotes, setPriceNotes] = useState<string>("");
  const [isRegisteringPrice, startPriceTransition] = useTransition();

  const costBreakdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estimate && costBreakdownRef.current) {
      costBreakdownRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [estimate]);

  const fetchSnapshots = (productId: string) => {
    startSnapshotsTransition(async () => {
      const result = await getProductSnapshotsAction(productId);

      if (result.success) {
        setSnapshots(result.data);
      } else {
        setSnapshots([]);
      }
    });
  };

  const fetchCurrentPrice = (productId: string) => {
    getCurrentPriceAction(productId).then(result => {
      setCurrentPrice(result.data);
    });
  };

  const fetchPriceHistory = (productId: string) => {
    getPriceHistoryAction(productId).then(result => {
      setPriceHistory(result.data);
    });
  };

  const handleProductChange = (product: ProductOption | null) => {
    setSelectedProduct(product);
    setEstimate(null);
    setWastePct(0);
    setTaxPct(TAX_PERCENTAGE);
    setApplyTax(true);
    setError(null);
    setCurrentPrice(null);
    setPriceHistory([]);
    setLastSavedSnapshotId(null);

    if (product?.id) {
      fetchSnapshots(product.id);
      fetchCurrentPrice(product.id);
      fetchPriceHistory(product.id);
    } else {
      setSnapshots([]);
    }
  };

  const handleEstimate = () => {
    if (!selectedProduct?.id) {
      setError("Seleccione un producto");

      return;
    }

    if (!quantityKg || quantityKg <= 0) {
      setError("Ingrese una cantidad válida");

      return;
    }

    setError(null);
    startEstimateTransition(async () => {
      const result = await getCostEstimateAction(selectedProduct.id, quantityKg);

      if (result.success) {
        setEstimate(result.data);
        setWastePct(result.data.wastePct);
        setTaxPct(TAX_PERCENTAGE);
      } else {
        toast.error(result.error);
        setEstimate(null);
      }
    });
  };

  const handleSave = () => {
    if (!estimate?.idFinalProduct || !estimate?.quantityKg) return;

    startSaveTransition(async () => {
      const result = await saveCostEstimate(estimate.idFinalProduct, estimate.quantityKg, notes);

      if (result.success) {
        toast.success("Estimación guardada con éxito");
        setNotes("");
        setLastSavedSnapshotId(result.data.id);

        if (selectedProduct?.id) {
          fetchSnapshots(selectedProduct.id);
        }
      } else {
        toast.error(result.error || "Error al guardar la estimación");
      }
    });
  };

  const handleRegisterPrice = () => {
    if (!selectedProduct?.id || !lastSavedSnapshotId || !estimate) return;

    const priceValue = Number(finalPrice);

    if (!priceValue || priceValue <= 0) {
      toast.error("Ingrese un precio final válido");

      return;
    }

    startPriceTransition(async () => {
      const result = await registerProductPrice(selectedProduct.id!, {
        idSnapshot: lastSavedSnapshotId,
        costBase: estimate.costTotalKg,
        wastePct,
        taxPct: applyTax ? taxPct : 0,
        finalPrice: priceValue,
        notes: priceNotes
      });

      if (result.success) {
        toast.success("Precio final registrado con éxito");
        setFinalPrice("");
        setPriceNotes("");
        setLastSavedSnapshotId(null);
        fetchCurrentPrice(selectedProduct!.id);
        fetchPriceHistory(selectedProduct!.id);
        setEstimate(null);
      } else {
        toast.error(result.error || "Error al registrar el precio");
      }
    });
  };

  const waterfall = useMemo(() => {
    if (!estimate) return null;

    const costBase = estimate.costTotalKg;
    const effectiveTaxPct = applyTax ? taxPct : 0;
    const costWithWaste = costBase / (1 - wastePct / 100);
    const wasteAmount = costWithWaste - costBase;
    const taxAmount = costWithWaste * (effectiveTaxPct / 100);
    const costWithTax = costWithWaste * (1 + effectiveTaxPct / 100);

    return { costBase, wastePct, wasteAmount, costWithWaste, taxPct: effectiveTaxPct, taxAmount, costWithTax };
  }, [estimate, wastePct, taxPct, applyTax]);

  const profitMargin = useMemo(() => {
    const price = Number(finalPrice);

    if (!price || price <= 0 || !waterfall) return null;

    const cost = waterfall.costWithTax;
    const profit = price - cost;
    const marginPct = (profit / price) * 100;

    return { profit: Number(profit.toFixed(2)), marginPct: Number(marginPct.toFixed(2)) };
  }, [finalPrice, waterfall]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
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
                options={productList}
                getOptionLabel={(option: ProductOption) => option?.fullName || option?.name || ""}
                onChange={(_: any, v: ProductOption | null) => handleProductChange(v)}
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
            <Grid item xs={6} sm={3} md={2}>
              <CustomTextField
                label='Unidades'
                type='number'
                placeholder='Ej: 100'
                value={quantityKg}
                onChange={e => {
                  setQuantityKg(Number(e.target.value));
                  setEstimate(null);
                  setError(null);
                  setLastSavedSnapshotId(null);
                }}
                error={!!error && (!quantityKg || quantityKg <= 0)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <CustomButton
                onClick={handleEstimate}
                isLoading={isEstimating}
                disabled={!selectedProduct || !quantityKg}
                startIcon={<Icon icon='mdi:calculator' />}
              >
                Estimar
              </CustomButton>
            </Grid>
          </Grid>
        </CustomCard>
      </Grid>

      {estimate && (
        <Grid item xs={12} ref={costBreakdownRef}>
          <CustomCard
            title={
              <Box display='flex' alignItems='center' gap={2}>
                <Icon icon='mdi:calculator-variant-outline' fontSize={20} />
                <span>Estimación de Costos</span>
              </Box>
            }
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={4}>
                <CustomCard>
                  <Box textAlign='center' py={2}>
                    <Typography variant='caption' color='text.secondary'>
                      Costo por Kg
                    </Typography>
                    <Typography variant='h5' fontWeight={600} color='primary.main'>
                      {formatCurrency(estimate.costTotalKg)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Material: {formatCurrency(estimate.stdCostMaterialKg)} | CIF: {formatCurrency(estimate.costCifKg)}
                    </Typography>
                  </Box>
                </CustomCard>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <CustomCard>
                  <Box textAlign='center' py={2}>
                    <Typography variant='caption' color='text.secondary'>
                      Costo por Unidad
                    </Typography>
                    <Typography variant='h5' fontWeight={600} color='primary.main'>
                      {formatCurrency(estimate.costTotalUnit)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Material: {formatCurrency(estimate.stdCostMaterialUnit)} | CIF:{" "}
                      {formatCurrency(estimate.costCifUnit)}
                    </Typography>
                  </Box>
                </CustomCard>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <CustomCard>
                  <Box textAlign='center' py={2}>
                    <Typography variant='caption' color='text.secondary'>
                      Costo Total por Kg
                    </Typography>
                    <Typography variant='h5' fontWeight={600} color='primary.main'>
                      {formatCurrency(estimate.costTotalKg * estimate.quantityKg)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Material: {formatCurrency(estimate.stdCostMaterialKg * estimate.quantityKg)} | CIF:{" "}
                      {formatCurrency(estimate.costCifKg * estimate.quantityKg)}
                    </Typography>
                  </Box>
                </CustomCard>
              </Grid>

              {(estimate.materialIncomplete || estimate.cifIncomplete) && (
                <Grid item xs={12}>
                  <Box display='flex' flexDirection='column' gap={1}>
                    {estimate.materialIncomplete && (
                      <Alert severity='warning' icon={<Icon icon='mdi:alert-outline' />}>
                        Algunos materiales no tienen costo registrado. La estimación puede estar incompleta.
                      </Alert>
                    )}
                    {estimate.cifIncomplete && (
                      <Alert severity='warning' icon={<Icon icon='mdi:alert-outline' />}>
                        El costo CIF no está incluido en la estimación.
                      </Alert>
                    )}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} md={8}>
                <CostBreakdown estimate={estimate} formatCurrency={formatCurrency} />
              </Grid>
              <Grid item xs={12} md={4}>
                {lastSavedSnapshotId === null && (
                  <>
                    <CustomTextField
                      label='Notas'
                      placeholder='Ej: Estimación para cotización cliente ABC'
                      multiline
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <CustomButton
                      onClick={handleSave}
                      isLoading={isSaving}
                      startIcon={<Icon icon='mdi:content-save-outline' />}
                      className='w-full'
                    >
                      Guardar Estimación
                    </CustomButton>
                  </>
                )}

                {lastSavedSnapshotId !== null && waterfall && (
                  <CustomCard>
                    <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                      Registrar Precio Final
                    </Typography>

                    <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
                      <Typography variant='body2' color='text.secondary'>
                        Costo Base (kg)
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {formatCurrency(waterfall.costBase)}
                      </Typography>
                    </Box>
                    <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
                      <Typography variant='body2' color='text.secondary'>
                        + Insumos ({waterfall.wastePct.toFixed(2)}%)
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {formatCurrency(waterfall.wasteAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
                    <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
                      <Typography variant='body2' color='text.secondary'>
                        Costo con Insumos
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {formatCurrency(waterfall.costWithWaste)}
                      </Typography>
                    </Box>
                    <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
                      <Typography variant='body2' color='text.secondary'>
                        + Impuesto ({waterfall.taxPct.toFixed(2)}%)
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {formatCurrency(waterfall.taxAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
                    <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
                      <Typography variant='body2' color='text.secondary'>
                        Costo Sugerido
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {formatCurrency(waterfall.costWithTax)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={applyTax} onChange={e => setApplyTax(e.target.checked)} />}
                          label='Aplicar IVA'
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomTextField
                          label='Insumos (%)'
                          type='number'
                          value={wastePct}
                          onChange={e => setWastePct(Number(e.target.value))}
                          InputProps={{ inputProps: { min: 0, step: 1 } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        {applyTax && (
                          <CustomTextField
                            label='Impuesto (%)'
                            type='number'
                            value={taxPct}
                            onChange={e => setTaxPct(Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0, step: 1 } }}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Grid>
                    </Grid>

                    <CustomTextField
                      label='Precio Final'
                      type='number'
                      placeholder='Ej: 12500.00'
                      value={finalPrice}
                      onChange={e => setFinalPrice(e.target.value)}
                      sx={{
                        mb: 2,
                        "& input": { fontWeight: 700, fontSize: "1.1rem" }
                      }}
                    />
                    {profitMargin && (
                      <Alert
                        severity={profitMargin.marginPct < 0 ? "warning" : "info"}
                        icon={
                          <Icon icon={profitMargin.marginPct < 0 ? "mdi:alert-outline" : "mdi:information-outline"} />
                        }
                        sx={{ mb: 2 }}
                      >
                        Margen de ganancia: {formatCurrency(profitMargin.profit)} ({profitMargin.marginPct.toFixed(2)}%)
                      </Alert>
                    )}
                    <CustomTextField
                      label='Notas'
                      placeholder='Ej: Precio revisado con CIF de Q2 2026'
                      multiline
                      rows={2}
                      value={priceNotes}
                      onChange={e => setPriceNotes(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <CustomButton
                      onClick={handleRegisterPrice}
                      isLoading={isRegisteringPrice}
                      startIcon={<Icon icon='mdi:content-save-outline' />}
                      className='w-full'
                    >
                      Guardar Precio
                    </CustomButton>
                  </CustomCard>
                )}
              </Grid>
            </Grid>
          </CustomCard>
        </Grid>
      )}

      {error && (
        <Grid item xs={12}>
          <Box display='flex' alignItems='center' gap={2} p={2} bgcolor='error.light' borderRadius={1}>
            <Icon icon='mdi:alert-circle-outline' fontSize={20} color='error' />
            <Typography color='error'>{error}</Typography>
          </Box>
        </Grid>
      )}

      {selectedProduct && currentPrice && (
        <Grid item xs={12}>
          <CurrentPriceCard price={currentPrice} formatCurrency={formatCurrency} />
        </Grid>
      )}

      {selectedProduct && priceHistory.length > 0 && (
        <Grid item xs={12}>
          <PriceHistory prices={priceHistory} formatCurrency={formatCurrency} />
        </Grid>
      )}

      {selectedProduct && (
        <Grid item xs={12}>
          {isLoadingSnapshots ? (
            <Box py={4}>
              <Loader type='component' />
            </Box>
          ) : (
            <SnapshotHistory
              snapshots={snapshots}
              onViewDetail={id => setSelectedSnapshotId(id)}
              formatCurrency={formatCurrency}
            />
          )}
        </Grid>
      )}

      <SnapshotDetailDialog
        snapshotId={selectedSnapshotId}
        open={selectedSnapshotId !== null}
        onClose={() => setSelectedSnapshotId(null)}
      />
    </Grid>
  );
};

export default EstimateView;
