import type { FC } from "react";

import { MenuItem, Stack, TableCell, TableRow, TextField } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomIconButton from "@/@core/components/mui/IconButton";
import type { IItemForm } from "./useCifPeriodItems";
import type { ICifType } from "@/types/pages/cif";

interface CifItemRowProps {
  item: IItemForm;
  cifTypes: ICifType[];
  isClosed: boolean;
  isPending: boolean;
  onFieldChange: (localId: string, field: keyof IItemForm, value: any) => void;
  onSave: (localId: string) => void;
  onDelete: (localId: string) => void;
}

const CifItemRow: FC<CifItemRowProps> = ({ item, cifTypes, isClosed, isPending, onFieldChange, onSave, onDelete }) => {
  return (
    <TableRow key={item.localId}>
      <TableCell>
        <TextField
          select
          size='small'
          value={item.idCifType}
          onChange={e => onFieldChange(item.localId, "idCifType", Number(e.target.value))}
          disabled={isClosed}
          sx={{ minWidth: 180 }}
        >
          {cifTypes
            .filter(ct => ct.active || ct.id === item.idCifType)
            .map(ct => (
              <MenuItem key={ct.id} value={ct.id}>
                {ct.name}
              </MenuItem>
            ))}
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          size='small'
          value={item.description}
          onChange={e => onFieldChange(item.localId, "description", e.target.value)}
          disabled={isClosed}
          placeholder='Descripción'
          sx={{ minWidth: 220 }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size='small'
          type='number'
          value={item.amount}
          onChange={e => onFieldChange(item.localId, "amount", e.target.value)}
          disabled={isClosed}
          placeholder='0.00'
          inputProps={{ min: 0, step: 0.01 }}
          sx={{ minWidth: 120 }}
        />
      </TableCell>
      <TableCell>
        <Stack direction='row' spacing={0.5}>
          <CustomIconButton
            size='small'
            color='success'
            disabled={isClosed || item.saved || isPending}
            onClick={() => onSave(item.localId)}
          >
            <Icon icon='mdi:content-save' fontSize={18} />
          </CustomIconButton>
          <CustomIconButton size='small' color='error' disabled={isClosed || isPending} onClick={() => onDelete(item.localId)}>
            <Icon icon='mdi:trash-can-outline' fontSize={18} />
          </CustomIconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default CifItemRow;
