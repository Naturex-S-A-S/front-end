"use client";

import { Fragment, useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import { Icon } from "@iconify/react";

import type { IOrderSupplyMaterialsByProvider } from "@/types/pages/order";

interface Props {
  items: IOrderSupplyMaterialsByProvider[];
  showActions?: boolean;
  showCost?: boolean;
  emptyMessage?: string;
  onChangeProvider?: (materialId: string, materialName: string, providerId: string) => void;
}

const MaterialsByProviderTable: React.FC<Props> = ({
  items,
  showActions = false,
  showCost = false,
  emptyMessage = "Sin materiales registrados",
  onChangeProvider
}) => {
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set([]));

  useEffect(() => {
    setOpenRows(new Set(items?.map(p => p.providerId) ?? []));
  }, [items]);

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

  if (!items?.length) {
    return (
      <Card>
        <CardContent>
          <Typography textAlign='center'>{emptyMessage}</Typography>
        </CardContent>
      </Card>
    );
  }

  const actionCols = showActions ? 1 : 0;
  const costCols = showCost ? 1 : 0;
  const innerColspan = 3 + actionCols + costCols;

  return (
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
            {items.map(item => (
              <Fragment key={item.providerId}>
                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <IconButton size='small' onClick={() => toggleRow(item.providerId)}>
                      <Icon icon={openRows.has(item.providerId) ? "mdi:chevron-up" : "mdi:chevron-down"} />
                    </IconButton>
                  </TableCell>
                  <TableCell className='font-bold'>{item.providerName || "-"}</TableCell>
                  <TableCell className='font-bold'>{item.providerAddress || "-"}</TableCell>
                  <TableCell className='font-bold'>{item.providerPhone || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse in={openRows.has(item.providerId)}>
                      <Box sx={{ p: 2 }}>
                        <Table size='medium'>
                          <TableHead>
                            <TableRow>
                              {showActions && <TableCell align='right'>Acciones</TableCell>}
                              <TableCell>Nombre</TableCell>
                              <TableCell align='right'>Cant. Disponible</TableCell>
                              <TableCell align='right'>Cant. Faltante</TableCell>
                              <TableCell align='right'>Cant. Total Pedido</TableCell>
                              {showCost && <TableCell align='right'>Costo Total</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {!item.materials?.length ? (
                              <TableRow>
                                <TableCell colSpan={innerColspan} sx={{ textAlign: "center" }}>
                                  Sin materiales
                                </TableCell>
                              </TableRow>
                            ) : (
                              item.materials.map(material => (
                                <TableRow
                                  key={material.id}
                                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                  {showActions && (
                                    <TableCell align='center'>
                                      <Tooltip title='Cambiar proveedor'>
                                        <IconButton
                                          size='small'
                                          onClick={() =>
                                            onChangeProvider?.(material.id, material.name, item.providerId)
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
                                  {showCost && <TableCell align='right'>{material.totalCost}</TableCell>}
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MaterialsByProviderTable;
