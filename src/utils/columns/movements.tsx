"use client";

import { Chip, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { formatDate } from "../format";

type params = {
  handleEdit?: (user: any) => void;
  handleDelete?: (userId: any) => void;
  filters: any;
  type: "packaging" | "feedStock";
};

export const columns = ({ filters, type }: params): GridColDef[] => {
  if (type === "packaging") {
    return [
      { field: "batch", headerName: "Lote", width: 100 },
      { field: "materialName", headerName: "Material", width: 150 },
      {
        field: "quantityG",
        headerName: `Cantidad (${filters?.measureUnit?.value})`,
        width: 120,
        renderCell: params => {
          const type = params.row.type;
          let quantity = "";
          const icon = type === "input" ? "+" : "-";

          switch (filters?.measureUnit?.value) {
            case "t":
              quantity = Number(params.row.quantityT).toFixed(2);
            case "kg":
              quantity = Number(params.row.quantityK).toFixed(2);
            case "g":
              quantity = Number(params.row.quantityG).toFixed(2);
            default:
              quantity = Number(params.row.quantity).toFixed(2);
          }

          return (
            <Tooltip title={`${type === "input" ? "Entrada" : "Salida"} por ${filters?.measureUnit?.label}`}>
              <Chip
                label={
                  <span className='text-sm font-semibold'>
                    <span className='mr-1'>{icon}</span>
                    {quantity}
                  </span>
                }
                color={type === "input" ? "success" : "error"}
              />
            </Tooltip>
          );
        }
      },
      {
        field: "charge",
        headerName: "Valor total",
        width: 100,
        renderCell: params => Number(params.row.charge).toFixed(2)
      },
      { field: "providerName", headerName: "Proveedor", width: 150 },
      { field: "rack", headerName: "Ubicación", width: 150, renderCell: params => params.row.rack?.name },
      { field: "classification", headerName: "Clasificación", width: 150 },
      {
        field: "dateCreated",
        headerName: "Fecha de creación",
        width: 150,
        renderCell: params => formatDate(params.row.dateCreated)
      }
    ];
  }

  return [
    { field: "batch", headerName: "Lote", width: 100 },
    { field: "materialName", headerName: "Material", width: 150 },
    {
      field: "quantityG",
      headerName: `Cantidad (${filters?.measureUnit?.value})`,
      width: 120,
      renderCell: params => {
        const type = params.row.type;
        let quantity = "";
        const icon = type === "input" ? "+" : "-";

        switch (filters?.measureUnit?.value) {
          case "t":
            quantity = Number(params.row.quantityT).toFixed(2);
          case "kg":
            quantity = Number(params.row.quantityK).toFixed(2);
          case "g":
            quantity = Number(params.row.quantityG).toFixed(2);
          default:
            quantity = Number(params.row.quantityG).toFixed(2);
        }

        return (
          <Tooltip title={`${type === "input" ? "Entrada" : "Salida"} por ${filters?.measureUnit?.label}`}>
            <Chip
              label={
                <span className='text-sm font-semibold'>
                  <span className='mr-1'>{icon}</span>
                  {quantity}
                </span>
              }
              color={type === "input" ? "success" : "error"}
            />
          </Tooltip>
        );
      }
    },
    {
      field: "charge",
      headerName: "Valor total",
      width: 100,
      renderCell: params => Number(params.row.charge).toFixed(2)
    },
    { field: "providerName", headerName: "Proveedor", width: 150 },
    { field: "rack", headerName: "Ubicación", width: 150, renderCell: params => params.row.rack?.name },
    { field: "classification", headerName: "Clasificación", width: 150 },
    {
      field: "expirationDate1",
      headerName: "Fecha de vencimiento",
      width: 150
    },
    {
      field: "dateCreated",
      headerName: "Fecha de creación",
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
