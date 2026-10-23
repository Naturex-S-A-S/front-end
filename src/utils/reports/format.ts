import { format, getISOWeek, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";

import type { ReportGranularity } from "@/types/pages/reports";

const EMPTY = "—";
const numberFormatter = new Intl.NumberFormat("es-CO");

const capitalize = (value: string): string => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const formatNumber = (value: number, minimumFractionDigits: number, maximumFractionDigits: number): string =>
  new Intl.NumberFormat("es-CO", { minimumFractionDigits, maximumFractionDigits }).format(value);

export const formatCop = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  const formatted = formatNumber(Math.abs(value), 0, 0);

  return value < 0 ? `-$${formatted}` : `$${formatted}`;
};

export const formatKg = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  return formatNumber(value, 3, 3);
};

export const formatTon = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  return formatNumber(value, 3, 3);
};

export const formatUnits = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  return formatNumber(value, 0, 0);
};

export const formatPct = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  return `${formatNumber(value, 2, 2)}%`;
};

export const formatCompact = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absolute >= 1_000_000_000) return `${sign}${formatNumber(absolute / 1_000_000_000, 0, 1)} mil M`;
  if (absolute >= 1_000_000) return `${sign}${formatNumber(absolute / 1_000_000, 0, 1)} M`;
  if (absolute >= 1_000) return `${sign}${formatNumber(absolute / 1_000, 0, 1)} mil`;

  return numberFormatter.format(value);
};

export const formatCompactCop = (value: number | null | undefined): string => {
  if (value == null) return EMPTY;

  return `$${formatCompact(value)}`;
};

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return EMPTY;

  const date = parseISO(value);

  if (!isValid(date)) return EMPTY;

  return format(date, "dd/MM/yyyy");
};

export const formatPeriodLabel = (period: string, granularity?: ReportGranularity): string => {
  if (!period) return EMPTY;

  if (/^\d{2}$/.test(period)) {
    const month = Number(period);

    if (month >= 1 && month <= 12) {
      return capitalize(format(new Date(2020, month - 1, 1), "MMM", { locale: es }));
    }
  }

  if (/^W\d{1,2}$/i.test(period)) return `Sem ${period.slice(1).padStart(2, "0")}`;
  if (/^\d{4}$/.test(period)) return period;

  const date = parseISO(period);

  if (!isValid(date)) return period;

  if (granularity === "year") return format(date, "yyyy");
  if (granularity === "day") return format(date, "d MMM", { locale: es });
  if (granularity === "week") return `Sem ${String(getISOWeek(date)).padStart(2, "0")}`;

  return capitalize(format(date, "MMM yyyy", { locale: es }));
};
