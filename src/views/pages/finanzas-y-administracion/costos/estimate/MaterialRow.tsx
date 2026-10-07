"use client";

import { useEffect, useState, type FC, type FocusEvent, type KeyboardEvent } from "react";

import { TableCell, TableRow, TextField } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomIconButton from "@/@core/components/mui/IconButton";
import type { ICostEstimateMaterial, IDummySimulationRow } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface MaterialRowProps {
  row: IDummySimulationRow;
  computed?: ICostEstimateMaterial | null;
  isPending: boolean;
  onChange: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemove: (localId: string) => void;
}

const toText = (value: number | string): string => (value === "" ? "" : String(value));

const MaterialRow: FC<MaterialRowProps> = ({ row, computed = null, isPending, onChange, onRemove }) => {
  const priceLabel = row.materialType === "feedstock" ? "Costo x (g)" : "Costo x (unidad)";
  const qtyLabel = row.materialType === "feedstock" ? "Cantidad base (g)" : "Unidades base";

  // Borrador local: se digita libremente y solo se propaga al salir del campo,
  // para no disparar el recálculo (y el bloqueo del input) con cada dígito.
  const [draftUnitCost, setDraftUnitCost] = useState<string>(() => toText(row.unitCost));
  const [draftQuantity, setDraftQuantity] = useState<string>(() => toText(row.quantity));

  useEffect(() => {
    setDraftUnitCost(toText(row.unitCost));
  }, [row.unitCost]);

  useEffect(() => {
    setDraftQuantity(toText(row.quantity));
  }, [row.quantity]);

  const commit = (field: "unitCost" | "quantity", raw: string) => {
    const current = field === "unitCost" ? toText(row.unitCost) : toText(row.quantity);

    if (raw === current) return;

    onChange(row.localId, field, raw === "" ? "" : Number(raw));
  };

  const handleBlur = (field: "unitCost" | "quantity") => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    commit(field, e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 500 }}>{row.materialName}</TableCell>
      <TableCell align='right'>
        <TextField
          size='small'
          type='number'
          value={draftQuantity}
          onChange={e => setDraftQuantity(e.target.value)}
          onBlur={handleBlur("quantity")}
          onKeyDown={handleKeyDown}
          inputProps={{ min: 0, step: "any", "aria-label": qtyLabel }}
          disabled={isPending}
          placeholder='0.00'
          sx={{ minWidth: 110 }}
        />
      </TableCell>
      <TableCell align='right'>
        <TextField
          size='small'
          type='number'
          value={draftUnitCost}
          onChange={e => setDraftUnitCost(e.target.value)}
          onBlur={handleBlur("unitCost")}
          onKeyDown={handleKeyDown}
          inputProps={{ min: 0, step: "any", "aria-label": priceLabel }}
          disabled={isPending}
          placeholder='0.00'
          sx={{ minWidth: 110 }}
        />
      </TableCell>
      {row.materialType === "feedstock" && (
        <TableCell align='right'>{formatCurrency(computed?.baseCost ?? null)}</TableCell>
      )}
      <TableCell align='right'>{formatCurrency(computed?.realTotalCost ?? null)}</TableCell>
      <TableCell align='right'>
        <CustomIconButton size='small' color='error' disabled={isPending} onClick={() => onRemove(row.localId)}>
          <Icon icon='mdi:trash-can-outline' fontSize={18} />
        </CustomIconButton>
      </TableCell>
    </TableRow>
  );
};

export default MaterialRow;
