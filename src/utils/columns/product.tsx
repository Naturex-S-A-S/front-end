/* eslint-disable lines-around-comment */
"use client";

import { useRouter } from "next/navigation";

import { Chip, Switch, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { useAbility } from "@/hooks/casl/useAbility";
import Loader from "@/@core/components/react-spinners";
import { ActionButton } from "./components/ActionButton";
import { PATHS } from "../paths";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "../constant";

type params = {
  handleStatus: (id: any, name: string, active: boolean) => void;
  isPending: boolean;
};

export const useColumns = ({ handleStatus, isPending }: params): GridColDef[] => {
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
            {ability.can(ABILITY_ACTIONS.READ as any, ABILITY_SUBJECT.PRODUCT, ABILITY_FIELDS.LISTADO) && (
              <ActionButton
                icon='hugeicons:view'
                onClick={() => router.push(`${PATHS.PRODUCT_DETAIL}/${params.row.id}`)}
              />
            )}
          </>
        );
      }
    },
    { field: "id", headerName: "Código", width: 100 },
    { field: "name", headerName: "Nombre", width: 200 },
    {
      field: "measurement",
      headerName: `Medida`,
      width: 100,
      renderCell: params => (
        <span>
          {Number(params.row.measurement).toFixed(2)} {params.row.unit}
        </span>
      )
    },
    {
      field: "minimumStandard",
      headerName: `Stock mínimo`,
      width: 150
    },
    {
      field: "productHistoryComplete",
      headerName: "Cantidad completa",
      width: 150,
      renderCell: params => params.row.productHistory?.reduce((acc: any, item: any) => acc + item.quantityCompleted, 0)
    },
    {
      field: "productHistoryInProcess",
      headerName: "Cantidad en proceso",
      width: 150,
      renderCell: params => params.row.productHistory?.reduce((acc: any, item: any) => acc + item.quantityInProcess, 0)
    },
    {
      field: "categories",
      headerName: "Categorias",
      width: 150,
      renderCell: params => {
        const visible = params.row.categories?.slice(0, 1);
        const remaining = params.row.categories?.slice(1);

        return (
          <div className='flex gap-2 justify-center items-center' style={{ height: "100%" }}>
            {visible?.map((category: any) => (
              <Chip key={category.id ?? category.name} label={category.name} variant='outlined' />
            ))}

            {remaining?.length > 0 && (
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
                onChange={() => handleStatus(params.row.id, params.row.name, params.row.active)}
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
