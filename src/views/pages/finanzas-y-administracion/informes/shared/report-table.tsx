"use client";

import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel
} from "@mui/material";

import type { ReportColumn } from "@/types/pages/reports";

interface ReportTableProps<TData, TTotals> {
  rows: TData[];
  columns: ReportColumn<TData, TTotals>[];
  totals?: TTotals;
  getRowKey: (row: TData, index: number) => string | number;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  highlightRow?: (row: TData) => boolean;
  maxHeight?: number;
}

interface SortState {
  key: string;
  direction: "asc" | "desc";
}

export default function ReportTable<TData, TTotals>({
  rows,
  columns,
  totals,
  getRowKey,
  defaultSort,
  highlightRow,
  maxHeight = 520
}: ReportTableProps<TData, TTotals>) {
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    const column = columns.find(item => item.key === sort.key);

    if (!column?.sortValue) return rows;

    return [...rows].sort((left, right) => {
      const a = column.sortValue?.(left);
      const b = column.sortValue?.(right);

      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;

      const comparison =
        typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "es");

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [rows, columns, sort]);

  const handleSort = (key: string) => {
    setSort(current =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const hasTotals = totals !== undefined && columns.some(column => column.renderTotal);

  return (
    <TableContainer sx={{ maxHeight, overflow: "auto" }}>
      <Table stickyHeader size='small' sx={{ minWidth: 650 }} aria-label='Tabla del reporte'>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                width={column.width}
                sortDirection={sort?.key === column.key ? sort.direction : false}
              >
                {column.sortValue ? (
                  <TableSortLabel
                    active={sort?.key === column.key}
                    direction={sort?.key === column.key ? sort.direction : "asc"}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow
              key={getRowKey(row, index)}
              hover
              sx={highlightRow?.(row) ? { bgcolor: "error.light", "& td": { color: "error.contrastText" } } : undefined}
            >
              {columns.map(column => (
                <TableCell key={column.key} align={column.align ?? "left"}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {hasTotals && totals !== undefined && (
          <TableFooter>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.key} align={column.align ?? "left"}>
                  {column.renderTotal?.(totals)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}
