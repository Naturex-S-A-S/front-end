"use client";

import { useEffect, useState } from "react";

import type { Theme } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import { Icon } from "@iconify/react";

import classNames from "classnames";

import { formatDate } from "@/utils/format";
import type { IOrderSupply } from "@/types/pages/order";
import { STATUS, STATUS_COLOR, STATUS_LABEL } from "@/utils/constant";
import ChangeProviderDialog from "./change-provider-dialog";

interface Props {
  orderSupply: IOrderSupply;
}

const Detail: React.FC<Props> = ({ orderSupply }) => {
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set([]));

  useEffect(() => {
    setOpenRows(new Set(orderSupply.materialsByProvider?.map(p => p.providerId) ?? []));
  }, [orderSupply.materialsByProvider]);

  const toggleRow = (providerId: string) => {
    setOpenRows(prev => {
      const next = new Set(prev);

      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }

      return next;
    });
  };

  const [providerDialog, setProviderDialog] = useState<{
    materialId: string;
    materialName: string;
    currentProviderId: string;
  } | null>(null);

  const handleChangeProvider = (materialId: string, materialName: string, currentProviderId: string) => {
    setProviderDialog({ materialId, materialName, currentProviderId });
  };

  const getCardClass = () =>
    classNames({
      "[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie": isBelowMdScreen && !isBelowSmScreen,
      "[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie": !isBelowMdScreen
    });

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
              <Card>
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                      <div className='flex h-full'>
                        <div className='flex flex-col justify-between'>
                          <Typography variant='caption'>Total en kg</Typography>
                          <Typography variant='h5'>{orderSupply.totalQuantityInKg}</Typography>
                        </div>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                      <div className='flex h-full'>
                        <div className='flex flex-col justify-between'>
                          <Typography variant='caption'>Total en unidades</Typography>
                          <Typography variant='h5'>{orderSupply.totalQuantityInUnits}</Typography>
                        </div>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} className={getCardClass()}>
                      <div className='flex h-full'>
                        <div className='flex flex-col justify-between'>
                          <Typography variant='caption'>Costo total</Typography>
                          <Typography variant='h5'>{orderSupply.totalChargeOrder}</Typography>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Materials table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell>Nombre</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell>Teléfono</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!orderSupply.materialsByProvider?.length ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                            Sin materiales registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        orderSupply.materialsByProvider.map(item => (
                          <>
                            <TableRow key={item.providerId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                              <TableCell>
                                <IconButton size='small' onClick={() => toggleRow(item.providerId)}>
                                  <Icon icon={openRows.has(item.providerId) ? "mdi:chevron-up" : "mdi:chevron-down"} />
                                </IconButton>
                              </TableCell>
                              <TableCell>{item.providerName || "-"}</TableCell>
                              <TableCell>{item.providerAddress || "-"}</TableCell>
                              <TableCell>{item.providerPhone || "-"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={6} sx={{ py: 0 }}>
                                <Collapse in={openRows.has(item.providerId)}>
                                  <Box sx={{ p: 2 }}>
                                    <Table size='medium'>
                                      <TableHead>
                                        <TableRow>
                                          {orderSupply.status === STATUS.en_proceso && (
                                            <TableCell align='right'>Acciones</TableCell>
                                          )}
                                          <TableCell>Nombre</TableCell>
                                          <TableCell align='right'>Cant. Disponible</TableCell>
                                          <TableCell align='right'>Cant. Faltante</TableCell>
                                          <TableCell align='right'>Cant. Total Pedido</TableCell>
                                          <TableCell align='right'>Costo Total</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {!item.materials?.length ? (
                                          <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                                              Sin materiales
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          item.materials.map(material => (
                                            <TableRow
                                              key={material.id}
                                              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            >
                                              {orderSupply.status === STATUS.en_proceso && (
                                                <TableCell align='center'>
                                                  <Tooltip title='Cambiar proveedor'>
                                                    <IconButton
                                                      size='small'
                                                      onClick={() =>
                                                        handleChangeProvider(
                                                          material.id,
                                                          material.name,
                                                          item.providerId
                                                        )
                                                      }
                                                    >
                                                      <Icon icon='ic:sharp-change-circle' />
                                                    </IconButton>
                                                  </Tooltip>
                                                </TableCell>
                                              )}
                                              <TableCell>{material.name}</TableCell>
                                              <TableCell align='right'>{material.quantityAvailable}</TableCell>
                                              <TableCell align='right'>{material.quantityMissing}</TableCell>
                                              <TableCell align='right'>{material.quantityTotalOrder}</TableCell>
                                              <TableCell align='right'>{material.totalCost}</TableCell>
                                            </TableRow>
                                          ))
                                        )}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
