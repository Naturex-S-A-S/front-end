"use client";
import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import useGetSalesOrder from "@/hooks/order/useGetSalesOrder";
import { useColumns } from "@/utils/columns/saleOrder";

const List = () => {
  const { salesOrder, isLoading } = useGetSalesOrder();
  const colDefs = useColumns();

  return (
    <CustomCard>
      <CustomDataGrid columns={colDefs} data={salesOrder} isLoading={isLoading} />
    </CustomCard>
  );
};

export default List;
