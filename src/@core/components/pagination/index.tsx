"use client";

import { useState, useMemo } from "react";

import { Box, Pagination as MuiPagination } from "@mui/material";

export function usePagination<T>(data: T[], itemsPerPage: number = 6) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(data.length / itemsPerPage);
  const safePage = Math.min(page, Math.max(1, pageCount));

  const paginatedData = useMemo(
    () => data.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage),
    [data, safePage, itemsPerPage]
  );

  return { paginatedData, page, setPage, pageCount, safePage };
}

interface PaginationBarProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
}

export function PaginationBar({ page, count, onChange }: PaginationBarProps) {
  if (count <= 1) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
      <MuiPagination
        page={page}
        count={count}
        onChange={(_, value) => onChange(value)}
        size='small'
        variant='tonal'
        color='primary'
      />
    </Box>
  );
}
