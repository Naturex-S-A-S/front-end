import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { columns } from "@/utils/columns/movements";
import { getMovements } from "@/api/packaging";
import { MaterialType } from "@/utils/enum";
import Filter from "../../movements/filter";

const defaultFilters = {
  kardexType: null,
  providerId: null,
  batch: "",
  materialType: MaterialType.PACKAGING,
  measureUnit: { label: "Gramo", value: "g" }
};

const Movements = () => {
  const [filters, setFilters] = useState({
    ...defaultFilters
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getPackagingMovements", filters],
    queryFn: () => getMovements(filters)
  });

  const onApplyFilters = (filters: any) => {
    setFilters({
      ...filters,
      materialType: MaterialType.PACKAGING
    });
  };

  const handleEdit = (id: string) => {
    toast(`${id} Pendiente`);
  };

  const handleDelete = (id: string) => {
    toast(`${id} Pendiente`);
  };

  return (
    <div className='flex flex-col gap-2'>
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid
        columns={columns({ handleEdit, handleDelete, filters, type: "packaging" })}
        getRowClassName={(params: any) => (params.row.type === "input" ? "input" : "output")}
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Movements;
