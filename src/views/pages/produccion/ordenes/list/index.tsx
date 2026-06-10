"use client";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/order";
import Filter from "./filter";
import CustomCard from "@/@core/components/mui/Card";
import type { IOrderList } from "@/types/pages/order";

interface Props {
  initialData: IOrderList[];
}

export default function List({ initialData }: Props) {
  const colDefs = useColumns();

  return (
    <CustomCard>
      <Filter />
      <CustomDataGrid columns={colDefs} data={initialData} />
    </CustomCard>
  );
}
