/* eslint-disable lines-around-comment */
"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@iconify/react";
import { Chip, IconButton, Switch, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { useAbility } from "@/hooks/casl/useAbility";
import Loader from "@/@core/components/react-spinners";
import { PATHS } from "../paths";

type params = {
  handleActive: (id: any, name: string, active: boolean) => void;
  filters: any;
  isPending: boolean;
};

/** Cantidad de un campo (prefijo + G/K/T) según la unidad del filtro. */
const formatByUnit = (row: any, prefix: "availableQuantity" | "expiredQuantity", unit?: string) => {
  const suffix = unit === "t" ? "T" : unit === "kg" ? "K" : "G";

  return Number(row[`${prefix}${suffix}`] ?? 0).toFixed(2);
};

export const useColumns = ({ handleActive, filters, isPending }: params): GridColDef[] => {
  const ability = useAbility();
  const router = useRouter();

  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      renderCell: params => {
        return (
          <>
            {ability.can("read", "Soporte", "Usuarios") && (
              <IconButton
                onMouseDown={e => e.stopPropagation()}
                onClick={() => router.push(`${PATHS.MATERIAL_PRIMA_DETAIL}/${params.row.id}`)}
              >
                <Icon icon='hugeicons:view' width={20} height={20} />
              </IconButton>
            )}
          </>
        );
      }
    },
    { field: "id", headerName: "Código", width: 100 },
    { field: "name", headerName: "Nombre", width: 150 },
    // Cantidad y valores solo de lo disponible (lotes no vencidos); lo vencido va aparte (D15/D16).
    {
      field: "availableQuantityG",
      headerName: `Cantidad (${filters?.measureUnit?.value})`,
      description: "Solo lotes no vencidos.",
      width: 110,
      renderCell: params => formatByUnit(params.row, "availableQuantity", filters?.measureUnit?.value)
    },
    {
      field: "availableChargeG",
      headerName: "Valor unitario",
      width: 150,
      minWidth: 150,
      renderCell: params => {
        const unit = filters?.measureUnit?.value;
        const value = unit === "t" ? params.row.availableChargeT : unit === "kg" ? params.row.availableChargeKg : params.row.availableChargeG;

        return value == null ? "—" : Number(value).toFixed(2);
      }
    },
    {
      field: "availableCharge",
      headerName: "Valor total",
      description: "Valor solo de la cantidad disponible. No incluye lo vencido.",
      width: 110,
      renderCell: params => Number(params.row.availableCharge ?? 0).toFixed(2)
    },
    {
      field: "expiredQuantityG",
      headerName: `Cantidad vencida (${filters?.measureUnit?.value})`,
      width: 150,
      minWidth: 150,
      renderCell: params => formatByUnit(params.row, "expiredQuantity", filters?.measureUnit?.value)
    },
    {
      field: "allergen",
      headerName: "Alergeno",
      width: 80,
      renderCell: params => (
        <div className='flex justify-center items-center' style={{ height: "100%" }}>
          {params.row.allergen ? (
            <Icon icon='lets-icons:check-fill' width={20} height={20} color='green' />
          ) : (
            <Icon icon='lets-icons:close-round-fill' width={20} height={20} color='gray' />
          )}
        </div>
      )
    },
    {
      field: "defaultProviderName",
      headerName: "Proveedor",
      width: 100
    },
    {
      field: "categories",
      headerName: "Categorias",
      width: 150,
      renderCell: params => {
        const visible = params.row.categories.slice(0, 1);
        const remaining = params.row.categories.slice(1);

        return (
          <div className='flex gap-2 justify-center items-center' style={{ height: "100%" }}>
            {visible.map((category: any) => (
              <Chip key={category.id ?? category.name} label={category.name} variant='outlined' />
            ))}

            {remaining.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {remaining.map((c: any, i: number) => (
                      <div key={c.id ?? `${c.name}-${i}`}>{c.name}</div>
                    ))}
                  </div>
                }
              >
                <Chip label={`+${remaining.length}`} variant='outlined' />
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      field: "active",
      headerName: "Activo",
      width: 80,
      renderCell: params => (
        <div className='flex justify-center items-center' style={{ height: "100%" }}>
          <Tooltip title={params.row.active ? "Desactivar" : "Activar"}>
            {isPending ? (
              <Loader type='component' />
            ) : (
              <Switch
                checked={params.row.active}
                onChange={() => handleActive(params.row.id, params.row.name, params.row.active)}
                color={params.row.active ? "success" : "error"}
                // {...(params.row.active ? { 'data-testid': 'active-switch' } : {})}
                {...(ability.can("update", "Soporte", "Usuarios") ? { disabled: false } : { disabled: true })}
                {...(params.row.active ? { slotProps: { input: { "aria-label": "controlled" } } } : {})}
              />
            )}
          </Tooltip>
        </div>
      )
    }
  ];
};
