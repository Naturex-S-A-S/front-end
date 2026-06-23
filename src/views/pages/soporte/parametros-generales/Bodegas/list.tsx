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
  const [updateData, setUpdateData] = useState<{ open: boolean; warehouseId: string | undefined }>({
    open: false,
    warehouseId: undefined
  });

  const toogleDialog = () => {
    setUpdateData({ open: false, warehouseId: undefined });
  };

  const handleEdit = (warehouse: IWarehouse) => {
    setUpdateData({ warehouseId: warehouse.id, open: true });
  };

  const colDefs = useColumns({ handleEdit });

  return (
    <div className='flex flex-col items-center gap-2'>
      {updateData.warehouseId && (
        <Update open={updateData.open} onClose={toogleDialog} warehouseId={updateData.warehouseId} />
      )}
      <Create />
      <CustomCard>
        <CustomDataGrid columns={colDefs} data={initialData} />
      </CustomCard>
    </div>
  );
};

export default List;
