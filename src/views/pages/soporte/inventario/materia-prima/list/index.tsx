import { useState } from "react";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { useColumns } from "@/utils/columns/feedstock";
import Filter from "./filter";
import useFeedstock from "@/hooks/feedstock/useFeedstock";
import usePatchFeedstock from "@/hooks/feedstock/usePatchFeedstock";

const defaultFilters = {
  category: undefined,
  measureUnit: { label: "Gramo", value: "g" },
  allergen: undefined,
  active: true
};

const List = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const { feedstock, isLoading } = useFeedstock(filters);
  const { handleActive, isPending } = usePatchFeedstock();
  const colDefs = useColumns({ handleActive, filters, isPending });

  const onApplyFilters = (filters: any) => {
    setFilters({
      ...filters,
      category: filters.category?.id
    });
  };

  return (
    <div className='flex flex-col gap-2'>
      <Filter onApplyFilters={onApplyFilters} defaultValues={defaultFilters} />
      <CustomDataGrid columns={colDefs} data={feedstock} isLoading={isLoading} />
    </div>
  );
};

export default List;
