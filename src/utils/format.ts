import moment from "moment";

export const formatDate = (date: string) => {
  return moment(date).format("YYYY-MM-DD");
};

export const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return "-";

  const truncate = Math.floor(value * 100) / 100;

  return `$${truncate.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
