import { useEffect, useState, useTransition } from "react";

import { Box, Divider, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import moment from "moment";

import CustomDialog from "@/@core/components/mui/Dialog";
import Loader from "@/@core/components/react-spinners";
import { getSnapshotDetailAction } from "@/api/costs/actions";
import CostBreakdown from "./CostBreakdown";
import type { ICostEstimate } from "@/types/pages/costs";

interface Props {
  snapshotId: number | null;
  open: boolean;
  onClose: () => void;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  estimation: { label: "Estimación", icon: "mdi:calculator-variant-outline", color: "#1976d2" },
  order_close: { label: "Cierre de orden", icon: "mdi:package-variant-closed", color: "#388e3c" }
};

/*const statusConfig: Record<string, { label: string; color: "warning" | "success" | "default" }> = {
  draft: { label: "Borrador", color: "warning" },
  completed: { label: "Completado", color: "success" },
  transient: { label: "Transitorio", color: "default" }
};*/

const SnapshotDetailDialog = ({ snapshotId, open, onClose }: Props) => {
  const [data, setData] = useState<ICostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || snapshotId === null) return;

    setData(null);
    setError(null);
    startTransition(async () => {
      const result = await getSnapshotDetailAction(snapshotId);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    });
  }, [snapshotId, open]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "-";

    return `$${Number(value).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const type = data ? typeConfig[data.snapshotType] ?? typeConfig.estimation : null;

  // const status = data ? statusConfig[data.status] ?? statusConfig.transient : null;

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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems='center'>
              {type && (
                <Grid item>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Icon icon={type.icon} fontSize={20} color={type.color} />
                    {data.idOrder && (
                      <Grid item>
                        <Typography variant='caption' color='text.secondary'>
                          Orden: <strong>{data.idOrder}</strong>
                        </Typography>
                      </Grid>
                    )}
                  </Box>
                </Grid>
              )}
              {/*status && (
                <Grid item>
                  <Chip label={status.label} color={status.color} size='small' variant='outlined' />
                </Grid>
              )*/}
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

          <Grid item xs={12}>
            <CostBreakdown estimate={data} formatCurrency={formatCurrency} />
          </Grid>
        </Grid>
      )}
    </CustomDialog>
  );
};

export default SnapshotDetailDialog;
