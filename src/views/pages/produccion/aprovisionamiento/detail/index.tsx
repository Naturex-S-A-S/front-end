"use client";

import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography
} from "@mui/material";

import MetricCardGroup from "@/@core/components/mui/MetricCardGroup";

import { formatDate } from "@/utils/format";
import type { IOrderSupply } from "@/types/pages/order";
import { STATUS, STATUS_COLOR, STATUS_LABEL } from "@/utils/constant";
import ChangeProviderDialog from "./change-provider-dialog";
import MaterialsByProviderTable from "../MaterialsByProviderTable";

interface Props {
  orderSupply: IOrderSupply;
}

const Detail: React.FC<Props> = ({ orderSupply }) => {
  const [providerDialog, setProviderDialog] = useState<{
    materialId: string;
    materialName: string;
    currentProviderId: string;
  } | null>(null);

  const handleChangeProvider = (materialId: string, materialName: string, currentProviderId: string) => {
    setProviderDialog({ materialId, materialName, currentProviderId });
  };

  return (
    <>
      <Grid container spacing={4}>
        {/* Left panel */}
        <Grid item xs={12} md={4} height='100%'>
          <Card>
            <CardContent>
              <Box display='flex' flexDirection='column' gap={4}>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography variant='caption' color='textSecondary'>
                      Lote
                    </Typography>
                    <Typography variant='h6'>{orderSupply.batch}</Typography>
                  </Box>
                  <Chip
                    label={orderSupply.statusName ?? STATUS_LABEL[orderSupply.status]}
                    color={STATUS_COLOR[orderSupply.status] ?? "default"}
                    size='small'
                  />
                </Box>

                <Divider />

                <Box display='flex' flexDirection='column' gap={2}>
                  <Box display='flex' alignItems='center' justifyContent='space-between' gap={2}>
                    <Typography variant='body2' color='textSecondary' sx={{ flex: 1, minWidth: 0 }}>
                      Usuario
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{ whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere" }}
                      >
                        {orderSupply.userName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='textSecondary'>
                      Fecha de creación
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {orderSupply.dateCreated ? formatDate(orderSupply.dateCreated) : "-"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Typography variant='h6'>Productos</Typography>

                {orderSupply.products?.map(product => (
                  <Box key={product.id} display='flex' justifyContent='space-between' alignItems='center' gap={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant='body2'
                        sx={{ whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere" }}
                      >
                        {product.fullName}
                      </Typography>
                    </Box>
                    <Chip label={`${product.units} u`} size='small' color='primary' variant='outlined' />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right panel */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={4}>
            {/* Stats */}
            <Grid item xs={12}>
              <MetricCardGroup
                gridItemProps={{ xs: 12, sm: 6, md: 4 }}
                items={[
                  { icon: "mdi:weight-kilogram", label: "Total en kg", value: orderSupply.totalQuantityInKg ?? "-" },
                  { icon: "mdi:package-variant", label: "Total en unidades", value: orderSupply.totalQuantityInUnits ?? "-" },
                  { icon: "mdi:cash-multiple", label: "Costo total", value: orderSupply.totalChargeOrder ?? "-" },
                ]}
              />
            </Grid>

            {/* Materials table */}
            <Grid item xs={12}>
              <MaterialsByProviderTable
                items={orderSupply.materialsByProvider ?? []}
                showActions={orderSupply.status === STATUS.en_proceso}
                showCost
                onChangeProvider={handleChangeProvider}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {orderSupply.status === STATUS.en_proceso && providerDialog && (
        <ChangeProviderDialog
          open={!!providerDialog}
          toogleDialog={() => setProviderDialog(null)}
          orderSupplyId={orderSupply.id}
          materialId={providerDialog.materialId}
          materialName={providerDialog.materialName}
        />
      )}
    </>
  );
};

export default Detail;
