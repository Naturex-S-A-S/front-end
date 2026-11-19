"use client";

import { Fragment, useEffect, useState } from "react";

import {
  Box,
  Chip,
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
import CustomCard from "@/@core/components/mui/Card";
import {
  SUPPLY_COLUMN_HELP,
  SUPPLY_STATUS_COLOR,
  SUPPLY_STATUS_LABEL,
  supplyPending,
  supplyStatus
} from "@/utils/supplyProgress";

interface Props {
  items: IOrderSupplyMaterialsByProvider[];
  showActions?: boolean;
  showCost?: boolean;

  /** Muestra Cant. Ingresada, Cant. Pendiente y el estado. Solo en el detalle de una orden ya creada. */
  showReceived?: boolean;
  emptyMessage?: string;
  onChangeProvider?: (materialId: string, materialName: string, providerId: string) => void;
}

const HeaderCell = ({ label, help, align }: { label: string; help: string; align?: "right" }) => (
  <TableCell align={align}>
    <Tooltip title={help} arrow>
      <span className='inline-flex items-center gap-1 cursor-help'>
        {label}
        <Icon icon='mdi:information-outline' fontSize={14} aria-hidden />
      </span>
    </Tooltip>
  </TableCell>
);

const MaterialsByProviderTable: React.FC<Props> = ({
  items,
  showActions = false,
  showCost = false,
  showReceived = false,
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
      <CustomCard>
        <Typography textAlign='center'>{emptyMessage}</Typography>
      </CustomCard>
    );
  }

  const actionCols = showActions ? 1 : 0;
  const costCols = showCost ? 1 : 0;
  const receivedCols = showReceived ? 3 : 0;

  // Código, Nombre, Disponible, Faltante y Total siempre están.
  const innerColspan = 5 + actionCols + receivedCols + costCols;

  return (
    <CustomCard>
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
                    <Box sx={{ p: 2, overflowX: "auto" }}>
                      <Table size='medium'>
                        <TableHead>
                          <TableRow>
                            {showActions && <TableCell align='right'>Acciones</TableCell>}
                            <HeaderCell label='Código' help={SUPPLY_COLUMN_HELP.code} />
                            <HeaderCell label='Nombre' help={SUPPLY_COLUMN_HELP.name} />
                            <HeaderCell label='Cant. Disponible' help={SUPPLY_COLUMN_HELP.available} align='right' />
                            <HeaderCell label='Cant. Faltante' help={SUPPLY_COLUMN_HELP.missing} align='right' />
                            <HeaderCell label='Cant. Total Pedido' help={SUPPLY_COLUMN_HELP.total} align='right' />
                            {showReceived && (
                              <>
                                <HeaderCell label='Cant. Ingresada' help={SUPPLY_COLUMN_HELP.received} align='right' />
                                <HeaderCell label='Cant. Pendiente' help={SUPPLY_COLUMN_HELP.pending} align='right' />
                                <HeaderCell label='Estado' help={SUPPLY_COLUMN_HELP.status} />
                              </>
                            )}
                            {showCost && <HeaderCell label='Costo Total' help={SUPPLY_COLUMN_HELP.cost} align='right' />}
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
                            item.materials.map(material => {
                              const received = material.quantityReceived ?? 0;

                              const pending =
                                material.quantityPending ?? supplyPending(material.quantityTotalOrder, received);

                              const status = supplyStatus(material.quantityTotalOrder, received);

                              return (
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
                                  <TableCell className='font-medium'>{material.id}</TableCell>
                                  <TableCell>{material.name}</TableCell>
                                  <TableCell align='right'>{material.quantityAvailable}</TableCell>
                                  <TableCell align='right'>{material.quantityMissing}</TableCell>
                                  <TableCell align='right'>{material.quantityTotalOrder}</TableCell>
                                  {showReceived && (
                                    <>
                                      <TableCell align='right'>{received}</TableCell>
                                      <TableCell align='right'>{pending}</TableCell>
                                      <TableCell>
                                        <Chip
                                          size='small'
                                          variant='tonal'
                                          color={SUPPLY_STATUS_COLOR[status]}
                                          label={SUPPLY_STATUS_LABEL[status]}
                                        />
                                      </TableCell>
                                    </>
                                  )}
                                  {showCost && <TableCell align='right'>{material.totalCost}</TableCell>}
                                </TableRow>
                              );
                            })
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
    </CustomCard>
  );
};

export default MaterialsByProviderTable;
