"use client";
import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import type { IPeriod } from "@/types/pages/cif";
import { addItemToPeriod, closePeriod, deleteItemInPeriod, updateItemInPeriod } from "@/api/cif/actions";

export interface IItemForm {
  localId: string;
  id?: number;
  idCifType: number | "";
  description: string;
  amount: number | "";
  saved: boolean;
}

let tempIdCounter = 0;
const genLocalId = () => `item-${Date.now()}-${++tempIdCounter}`;

export const useCifPeriodItems = (period: IPeriod | null) => {
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

  const cifTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const setItemField = (localId: string, field: keyof IItemForm, value: any) => {
    setItems(prev => prev.map(item => (item.localId === localId ? { ...item, [field]: value, saved: false } : item)));
  };

  const handleSave = (localId: string) => {
    if (!period) return;

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
    if (!period) return;

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
    if (!period) return;

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

  return {
    items,
    isPending,
    isClosed,
    cifTotal,
    closeDialogOpen,
    setCloseDialogOpen,
    setItemField,
    handleSave,
    handleDelete,
    handleAdd,
    handleClosePeriod
  };
};
