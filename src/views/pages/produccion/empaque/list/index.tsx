"use client";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/packing";
import type { IPacking } from "@/types/pages/packing";

interface Props {
  initialData: IPacking[];
}

const List = ({ initialData }: Props) => {
  const colDefs = useColumns();

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={initialData} isLoading={false} />
    </CustomCard>
  );
};

export default List;
