import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material";

import MetricCardGroup from "@/@core/components/mui/MetricCardGroup";
import { formatDate } from "@/utils/format";
import type { IOrder } from "@/types/pages/order";
import Adjustment from "./adjustment";
import { STATUS, STATUS_COLOR, STATUS_LABEL } from "@/utils/constant";
import MaterialTable from "../MaterialTable";
import { MaterialTypeKey } from "@/utils/enum";

interface Props {
  order: IOrder;
}

const Detail: React.FC<Props> = ({ order }) => {
  const totalQuantityTotal = order.details?.reduce((a, b) => a + (b.typeMaterial === 'materia_prima' ? b.quantityTotal : 0), 0) ?? 0;

  const materials = order.details.map(item => ({
    type: item.typeMaterial,
    name: item.nameMaterial,
    quantityFormulation: item.quantity,
    quantityTotalOrder: item.quantityTotal
  }));

  return (
    <Grid container spacing={4}>
      {/* Left panel */}
      <Grid item xs={12} md={4} height='100%'>
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' gap={4}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box>
                  <Typography variant='caption' color='textSecondary'>
                    Formulación
                  </Typography>
                  <Typography variant='h6'>{order.formulationName}</Typography>
                </Box>
                <Chip
                  label={order.statusName ?? STATUS_LABEL[order.status]}
                  color={STATUS_COLOR[order.status] ?? "default"}
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
                      {order.userFullName}
                    </Typography>
                  </Box>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Lote
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.batch}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Versión
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    v{order.sequentialVersionNumber}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de vencimiento
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.dateExpiration ? formatDate(order.dateExpiration) : "-"}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='textSecondary'>
                    Fecha de creación
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {order.dateCreated ? formatDate(order.dateCreated) : "-"}
                  </Typography>
                </Box>
                {order.dateClosed && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='textSecondary'>
                      Fecha de cierre
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {formatDate(order.dateClosed)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider />

              <Typography variant='h6'>Presentaciones</Typography>

              {order.items?.map(item => (
                <Box
                  key={item.idFinalProduct}
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  gap={2}
                >
                  {/* Left: allow the name to wrap, grow and not overflow */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='body2'
                      sx={{ whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                      {item.finalProduct.name}
                    </Typography>
                    <Typography variant='caption' color='textSecondary' sx={{ display: "block" }}></Typography>
                  </Box>
                  <Box display='flex' gap={1} sx={{ flexShrink: 0 }}>
                    <Chip label={`${item.quantityU} u`} size='small' color='primary' variant='outlined' />
                    <Chip
                      label={`${item.finalProduct.measurement} ${item.finalProduct.unit}`}
                      size='small'
                      variant='outlined'
                    />
                  </Box>
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
              items={[
                {
                  icon: "mdi:weight-kilogram",
                  label: "Cantidad esperada (Kg)",
                  value: order.quantityExpectedKg ?? "-",
                  gridItemProps: { xs: 12, sm: 6, md: 3 }
                },
                {
                  icon: "mdi:package-variant",
                  label: "Cantidad producida (Kg)",
                  value: order.quantityProducedKg ?? "-",
                  gridItemProps: { xs: 12, sm: 6, md: 3 }
                },
                {
                  icon: "mdi:alert-circle-outline",
                  label: "Pérdida (%)",
                  value: order.lossPercentage ?? "-",
                  gridItemProps: { xs: 12, sm: 6, md: 3 }
                },
                {
                  icon: "mdi:calculator",
                  label: "Total materia prima (g)",
                  value: totalQuantityTotal.toFixed(2),
                  gridItemProps: { xs: 12, sm: 6, md: 3 }
                }
              ]}
            />
          </Grid>

          {/* Materials table */}
          <Grid item xs={12} sm={6}>
            <MaterialTable
              title='Material de empaque'
              type={MaterialTypeKey.PACKAGING}
              items={materials}
              quantityLabel='Cantidad'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MaterialTable
              title='Materia prima'
              type={MaterialTypeKey.FEEDSTOCK}
              items={materials}
              quantityLabel='Cantidad (g)'
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Adjustment
          materials={order.details}
          products={order.items}
          orderId={order.id}
          kardex={order.kardex}
          batch={order.batch}
          canCreate={order.status === STATUS.en_proceso}
        />
      </Grid>
    </Grid>
  );
};

export default Detail;
