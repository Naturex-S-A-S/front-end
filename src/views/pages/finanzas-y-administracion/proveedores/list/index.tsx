"use client";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/supplier";
import type { IProvider } from "@/types/pages/financeAdministation";

interface Props {
  initialData: IProvider[];
}

export default function List({ initialData }: Props) {
  const colDefs = useColumns();

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={initialData} />
    </CustomCard>
  );
}
