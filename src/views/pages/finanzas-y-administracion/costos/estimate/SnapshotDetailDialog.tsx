import { useEffect, useMemo, useState, useTransition } from "react";

import { Box, Chip, Divider, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import moment from "moment";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import CustomDialog from "@/@core/components/mui/Dialog";
import Loader from "@/@core/components/react-spinners";
import { getSnapshotDetailAction, updateSnapshotAction } from "@/api/costs/actions";
import EstimateResultCard from "./EstimateResultCard";
import type { ICostEstimate } from "@/types/pages/costs";
import { applyMaterialQuantityChange, mapMaterialsToPriceInput } from "@/utils/costs";
import { registerPriceSchema, type RegisterPriceFormValues } from "@/utils/schemas/costs";
import { TAX_PERCENTAGE } from "@/utils/constant";

interface Props {
  snapshotId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  estimation: { label: "Estimación", icon: "mdi:calculator-variant-outline", color: "#1976d2" },
  order_close: { label: "Cierre de orden", icon: "mdi:package-variant-closed", color: "#388e3c" }
};

const statusConfig: Record<string, { label: string; color: "warning" | "success" | "default" }> = {
  draft: { label: "Borrador", color: "warning" },
  completed: { label: "Completado", color: "success" },
  transient: { label: "Transitorio", color: "default" }
};

const SnapshotDetailDialog = ({ snapshotId, open, onClose, onSaved }: Props) => {
  const [data, setData] = useState<ICostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const methods = useForm<RegisterPriceFormValues>({
    defaultValues: {
      wastePct: 0,
      taxPct: TAX_PERCENTAGE,
      applyTax: true,
      finalPrice: undefined,
      priceNotes: "",
      isDefinitive: false,
      materials: []
    },
    resolver: yupResolver(registerPriceSchema) as any
  });

  const wastePct = methods.watch("wastePct");
  const taxPct = methods.watch("taxPct");
  const applyTax = methods.watch("applyTax");
  const finalPrice = methods.watch("finalPrice");

  const loadDetail = (id: number) => {
    setData(null);
    setError(null);
    startTransition(async () => {
      const result = await getSnapshotDetailAction(id);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  useEffect(() => {
    if (!open || snapshotId === null) return;

    loadDetail(snapshotId);
  }, [snapshotId, open]);

  useEffect(() => {
    if (data?.status === "draft") {
      methods.reset({
        wastePct: data.wastePct,
        taxPct: TAX_PERCENTAGE,
        applyTax: true,
        finalPrice: undefined,
        priceNotes: data.notes ?? "",
        isDefinitive: false,
        materials: mapMaterialsToPriceInput(data)
      });
    }
  }, [data, methods]);

  const readOnly = data?.status !== "draft";
  const type = data ? typeConfig[data.snapshotType] ?? typeConfig.estimation : null;
  const status = data ? statusConfig[data.status] ?? statusConfig.transient : null;

  const waterfall = useMemo(() => {
    if (!data) return null;

    const costBase = data.costTotalKg;
    const effectiveTaxPct = applyTax ? taxPct : 0;
    const costWithWaste = costBase / (1 - wastePct / 100);
    const wasteAmount = costWithWaste - costBase;
    const taxAmount = costWithWaste * (effectiveTaxPct / 100);
    const costWithTax = costWithWaste * (1 + effectiveTaxPct / 100);

    return {
      costBase,
      wastePct,
      wasteAmount,
      costWithWaste,
      taxPct: effectiveTaxPct,
      taxAmount,
      costWithTax
    };
  }, [data, wastePct, taxPct, applyTax]);

  const profitMargin = useMemo(() => {
    const price = Number(finalPrice);

    if (!price || price <= 0 || !waterfall) return null;

    const cost = waterfall.costWithTax;
    const profit = price - cost;
    const marginPct = (profit / price) * 100;

    return { profit: Number(profit.toFixed(2)), marginPct: Number(marginPct.toFixed(2)) };
  }, [finalPrice, waterfall]);

  const handleMaterialChange = (index: number, value: string) => {
    if (!data) return;

    const updated = applyMaterialQuantityChange(data, index, value);

    setData(updated);
    methods.setValue("materials", mapMaterialsToPriceInput(updated));
  };

  const handleRegisterPrice = methods.handleSubmit(async (values: RegisterPriceFormValues) => {
    if (!data || snapshotId === null) return;

    startSaveTransition(async () => {
      const result = await updateSnapshotAction(snapshotId, {
        idFinalProduct: data.idFinalProduct,
        units: data.quantityKg,
        wastePct: values.wastePct,
        taxPct: values.applyTax ? values.taxPct : 0,
        commissionPct: 0,
        finalPrice: values.finalPrice,
        isDefinitive: values.isDefinitive,
        notes: values.priceNotes,
        materials: values.materials
      });

      if (result.success) {
        toast.success("Snapshot actualizado con éxito");
        onSaved?.();
        loadDetail(snapshotId);
      } else {
        toast.error(result.error || "Error al actualizar el snapshot");
      }
    });
  });

  console.log({ data });

  return (
    <CustomDialog
      open={open}
      toogleDialog={onClose}
      title={snapshotId !== null ? `Snapshot #${snapshotId}` : "Snapshot"}
      maxWidth='lg'
    >
      {isPending && !data && (
        <Box display='flex' justifyContent='center' py={6}>
          <Loader type='component' />
        </Box>
      )}

      {error && (
        <Box display='flex' alignItems='center' gap={2} p={2} bgcolor='error.light' borderRadius={1}>
          <Icon icon='mdi:alert-circle-outline' fontSize={20} color='error' />
          <Typography color='error'>{error}</Typography>
        </Box>
      )}

      {data && (
        <FormProvider {...methods}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems='center'>
                {type && (
                  <Grid item>
                    <Box display='flex' alignItems='center' gap={1}>
                      <Icon icon={type.icon} fontSize={20} color={type.color} />
                      {data.idOrder && (
                        <Typography variant='caption' color='text.secondary'>
                          Orden: <strong>{data.idOrder}</strong>
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
                {status && (
                  <Grid item>
                    <Chip label={status.label} color={status.color} size='small' variant='outlined' />
                  </Grid>
                )}
                <Grid item>
                  <Typography variant='body2' color='text.secondary'>
                    {moment(data.dateSnapshot).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body2' color='text.secondary'>
                    {data.nameUser}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {data.notes && (
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                  Notas: {data.notes}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Cantidad: <strong>{data.quantityKg} kg</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    % Merma: <strong>{data.wastePct}%</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Promedio CIF: <strong>{data.cifAveragingMonths} meses</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Períodos CIF usados: <strong>{data.cifPeriodsUsed}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <EstimateResultCard
              estimate={data}
              title='Detalle del Costo'
              readOnly={readOnly}
              scrollOnChange={false}
              waterfall={waterfall}
              profitMargin={profitMargin}
              isRegisteringPrice={isSaving}
              onMaterialChange={handleMaterialChange}
              onRegisterPrice={handleRegisterPrice}
            />
          </Grid>
        </FormProvider>
      )}
    </CustomDialog>
  );
};

export default SnapshotDetailDialog;
