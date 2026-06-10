"use client";

import { useState } from "react";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import useGetOrders from "@/hooks/order/useGetOrders";
import { useColumns } from "@/utils/columns/order";
import Filter from "./filter";
import CustomCard from "@/@core/components/mui/Card";

const defaultFilters = {
  product: undefined,
  status: undefined
};

export default function List() {
  const [filters, setFilters] = useState(defaultFilters);

  const { orders, isLoading } = useGetOrders(filters);
  const colDefs = useColumns();

  return (
    <CustomCard>
      <Filter onApplyFilters={setFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={colDefs} data={orders} isLoading={isLoading} />
    </CustomCard>
  );
}
