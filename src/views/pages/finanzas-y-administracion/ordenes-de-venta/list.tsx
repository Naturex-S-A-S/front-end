"use client";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/saleOrder";
import type { ISaleOrder } from "@/types/pages/saleOrder";

interface Props {
  initialData: ISaleOrder[];
}

const List = ({ initialData }: Props) => {
  const colDefs = useColumns();

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={initialData} />
    </CustomCard>
  );
};

export default List;
