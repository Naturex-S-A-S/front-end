import type { FC } from "react";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomButton from "@/@core/components/mui/Button";
import type { IItemForm } from "./useCifPeriodItems";
import type { ICifType } from "@/types/pages/cif";
import CifItemRow from "./CifItemRow";

interface CifItemsTableProps {
  items: IItemForm[];
  cifTypes: ICifType[];
  isClosed: boolean;
  isPending: boolean;
  onFieldChange: (localId: string, field: keyof IItemForm, value: any) => void;
  onSave: (localId: string) => void;
  onDelete: (localId: string) => void;
  onAdd: () => void;
}

const CifItemsTable: FC<CifItemsTableProps> = ({ items, cifTypes, isClosed, isPending, onFieldChange, onSave, onDelete, onAdd }) => {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Tipo de CIF</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Monto</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <CifItemRow
              key={item.localId}
              item={item}
              cifTypes={cifTypes}
              isClosed={isClosed}
              isPending={isPending}
              onFieldChange={onFieldChange}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
          {!isClosed && (
            <TableRow>
              <TableCell colSpan={4}>
                <CustomButton variant='text' size='small' color='primary' onClick={onAdd} startIcon={<Icon icon='mdi:plus' />}>
                  Agregar ítem
                </CustomButton>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CifItemsTable;
