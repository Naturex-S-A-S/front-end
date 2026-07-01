"use client";
import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  Box,
  Card,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import CustomCard from "@/@core/components/mui/Card";
import CustomIconButton from "@/@core/components/mui/IconButton";
import type { ICifType, IPeriod } from "@/types/pages/cif";
import { addItemToPeriod, closePeriod, deleteItemInPeriod, updateItemInPeriod } from "@/api/cif/actions";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import { formatCurrency } from "@/utils/format";

// ---

interface IItemForm {
  localId: string;
  id?: number;
  idCifType: number | "";
  description: string;
  amount: number | "";
  saved: boolean;
}

let tempIdCounter = 0;
const genLocalId = () => `item-${Date.now()}-${++tempIdCounter}`;

const PeriodDetail = ({ period, cifTypes }: { period: IPeriod | null; cifTypes: ICifType[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<IItemForm[]>([]);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  useEffect(() => {
    if (!period) return;

    setItems(prev => {
      const serverItems: IItemForm[] = period.items.map(item => ({
        localId: genLocalId(),
        id: item.id,
        idCifType: item.idCifType,
        description: item.description,
        amount: item.amount,
        saved: true
      }));

      const unsavedItems = prev.filter(item => !item.id);

      return [...serverItems, ...unsavedItems];
    });
  }, [period, period?.id]);

  const isClosed = period?.status === "closed";

  if (!period) {
    return (
      <CustomCard>
        <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={8}>
          <Icon icon='mdi:alert-circle-outline' fontSize={48} color='error' />
          <Typography variant='h6' color='text.secondary'>
            Período no encontrado ....
          </Typography>
        </Box>
      </CustomCard>
    );
  }

  const setItemField = (localId: string, field: keyof IItemForm, value: any) => {
    setItems(prev => prev.map(item => (item.localId === localId ? { ...item, [field]: value, saved: false } : item)));
  };

  const cifTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const kg = Number(period.totalKgProduced) || 0;
  const cifPerKg = kg > 0 ? cifTotal / kg : 0;

  // --- Mutations ---

  const handleSave = (localId: string) => {
    const item = items.find(i => i.localId === localId);

    if (!item) return;

    if (!item.idCifType || item.amount === "" || item.amount === 0) {
      toast.error("Todos los campos son requeridos");

      return;
    }

    startTransition(async () => {
      const data = {
        idCifType: Number(item.idCifType),
        amount: Number(item.amount),
        description: item.description
      };

      if (item.id) {
        const result = await updateItemInPeriod(period.id, item.id, data);

        if (result.success) {
          toast.success("Ítem actualizado");
          setItems(prev => prev.map(i => (i.localId === localId ? { ...i, saved: true } : i)));
        } else {
          toast.error(result.error || "Error al actualizar el ítem");
        }
      } else {
        const created = await addItemToPeriod(period.id, data);

        if (created) {
          toast.success("Ítem agregado");
          setItems(prev =>
            prev.map(item =>
              item.localId === localId
                ? {
                    ...item,
                    id: created.id,
                    idCifType: created.idCifType,
                    description: created.description,
                    amount: created.amount,
                    saved: true
                  }
                : item
            )
          );
        } else {
          toast.error("Error al agregar el ítem");
        }
      }
    });
  };

  const handleDelete = (localId: string) => {
    const item = items.find(i => i.localId === localId);

    if (!item) return;

    startTransition(async () => {
      if (item.id) {
        const result = await deleteItemInPeriod(period.id, item.id);

        if (!result.success) {
          toast.error(result.error || "Error al eliminar el ítem");

          return;
        }

        toast.success("Ítem eliminado");
      }

      setItems(prev => prev.filter(i => i.localId !== localId));
    });
  };

  const handleAdd = () => {
    const lastItem = items[items.length - 1];

    if (lastItem && !lastItem.saved && lastItem.idCifType && lastItem.amount !== "" && lastItem.amount !== 0) {
      handleSave(lastItem.localId);
    }

    setItems(prev => [...prev, { localId: genLocalId(), idCifType: "", description: "", amount: "", saved: false }]);
  };

  const handleClosePeriod = () => {
    startTransition(async () => {
      const result = await closePeriod(period.id);

      if (result.success) {
        toast.success("Período cerrado con éxito");
        router.refresh();
        setCloseDialogOpen(false);
      } else {
        toast.error(result.error || "Error al cerrar el período");
      }
    });
  };

  return (
    <CustomCard
      title={
        <div className='flex items-center gap-2'>
          {period.name} ({period.month}/{period.year})
          <Chip
            label={period.status === "open" ? "Abierto" : "Cerrado"}
            size='small'
            color={period.status === "open" ? "success" : "default"}
            variant='outlined'
          />
        </div>
      }
      action={
        !isClosed && (
          <Box>
            <CustomButton
              variant='outlined'
              color='inherit'
              size='small'
              onClick={() => setCloseDialogOpen(true)}
              disabled={isPending}
            >
              <Stack direction='row' alignItems='center' spacing={1}>
                <Icon icon='uil:padlock' fontSize={15} />
                <span>Cerrar periodo</span>
              </Stack>
            </CustomButton>
          </Box>
        )
      }
    >
      <Stack direction='column'>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Icon icon='mdi:calendar' fontSize={15} />
          <Typography variant='body2'>
            {period.startDate} a {period.endDate}
          </Typography>
        </Stack>
        <Typography variant='body2'>{period.notes}</Typography>
      </Stack>

      <Grid container spacing={3} className='mt-2'>
        <Grid item xs={4}>
          <Card variant='outlined' className='h-full'>
            <Box textAlign='center' py={2}>
              <Typography variant='caption' color='text.secondary'>
                CIF Total del periodo
              </Typography>
              <Typography variant='h5' fontWeight={600} color='primary.main'>
                {formatCurrency(cifTotal)}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant='outlined' className='h-full'>
            <Box textAlign='center' py={2}>
              <Typography variant='caption' color='text.secondary'>
                Kg producidos
              </Typography>
              <Typography variant='h5' fontWeight={600} color='primary.main'>
                {period.totalKgProduced}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant='outlined' className='h-full'>
            <Box textAlign='center' py={2}>
              <Typography variant='caption' color='text.secondary'>
                CIF / Kg
              </Typography>
              <Typography variant='h5' fontWeight={600} color='primary.main'>
                {formatCurrency(cifPerKg)}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
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
                  <TableRow key={item.localId}>
                    <TableCell>
                      <TextField
                        select
                        size='small'
                        value={item.idCifType}
                        onChange={e => setItemField(item.localId, "idCifType", Number(e.target.value))}
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
                        onChange={e => setItemField(item.localId, "description", e.target.value)}
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
                        onChange={e => setItemField(item.localId, "amount", e.target.value)}
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
                          onClick={() => handleSave(item.localId)}
                        >
                          <Icon icon='mdi:content-save' fontSize={18} />
                        </CustomIconButton>
                        <CustomIconButton
                          size='small'
                          color='error'
                          disabled={isClosed || isPending}
                          onClick={() => handleDelete(item.localId)}
                        >
                          <Icon icon='mdi:trash-can-outline' fontSize={18} />
                        </CustomIconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!isClosed && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <CustomButton
                        variant='text'
                        size='small'
                        color='primary'
                        onClick={handleAdd}
                        startIcon={<Icon icon='mdi:plus' />}
                      >
                        Agregar ítem
                      </CustomButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <CustomDialog
        open={closeDialogOpen}
        toogleDialog={() => setCloseDialogOpen(false)}
        title='Cerrar período'
        maxWidth='xs'
      >
        <Stack spacing={4} alignItems='center'>
          <Typography variant='body1'>
            ¿Está seguro de que desea cerrar el período <b>{period.name}</b>? Una vez cerrado no podrá modificar los
            ítems.
          </Typography>
          <Stack direction='row' spacing={2}>
            <CustomButton variant='outlined' color='secondary' onClick={() => setCloseDialogOpen(false)}>
              Cancelar
            </CustomButton>
            <CustomButton onClick={handleClosePeriod} isLoading={isPending}>
              Cerrar período
            </CustomButton>
          </Stack>
        </Stack>
      </CustomDialog>
    </CustomCard>
  );
};

export default PeriodDetail;
