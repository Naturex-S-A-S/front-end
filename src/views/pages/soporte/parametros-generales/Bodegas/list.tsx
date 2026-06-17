"use client";

import { useState } from "react";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/warehouse";
import type { IWarehouse } from "@/types/pages/generalParameters";
import Create from "./create";
import Update from "./update";

interface Props {
  initialData: IWarehouse[];
}

const List = ({ initialData }: Props) => {
  const [updateData, setUpdateData] = useState<{ open: boolean; warehouse: IWarehouse | undefined }>({
    open: false,
    warehouse: undefined
  });

  const toogleDialog = () => {
    setUpdateData({ open: false, warehouse: undefined });
  };

  const handleEdit = (warehouse: IWarehouse) => {
    setUpdateData({ warehouse, open: true });
  };

  const colDefs = useColumns({ handleEdit });

  return (
    <div className='flex flex-col items-center gap-2'>
      {updateData.warehouse && (
        <Update open={updateData.open} onClose={toogleDialog} warehouse={updateData.warehouse} />
      )}
      <Create />
      <CustomCard>
        <CustomDataGrid columns={colDefs} data={initialData} />
      </CustomCard>
    </div>
  );
};

export default List;
