"use client";

import { useMemo } from "react";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { columns } from "@/utils/columns/orderSupply";
import Filter from "./filter";
import CustomCard from "@/@core/components/mui/Card";
import type { IOrderSupplyList } from "@/types/pages/order";

type Props = {
  initialData: IOrderSupplyList[];
};

export default function List({ initialData }: Props) {
  const columnsMemoized = useMemo(() => columns(), []);

  return (
    <CustomCard>
      <Filter />
      <CustomDataGrid columns={columnsMemoized} data={initialData} />
    </CustomCard>
  );
}
