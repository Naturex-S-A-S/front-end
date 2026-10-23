import { getLineColor } from "@/utils/reports/colors";

export interface PivotSeries {
  key: string;
  label: string;
  color: string;
}

export interface PivotResult {
  data: Array<Record<string, string | number>>;
  series: PivotSeries[];
}

export function pivotStacked<T>(
  rows: T[],
  options: {
    period: (row: T) => string;
    series: (row: T) => { id: string; name: string };
    value: (row: T) => number;
  }
): PivotResult {
  const periods: string[] = [];
  const periodSet = new Set<string>();
  const series = new Map<string, string>();
  const values = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const period = options.period(row);
    const currentSeries = options.series(row);

    if (!periodSet.has(period)) {
      periodSet.add(period);
      periods.push(period);
    }

    if (!series.has(currentSeries.id)) series.set(currentSeries.id, currentSeries.name);

    const periodValues = values.get(period) ?? new Map<string, number>();

    periodValues.set(currentSeries.id, (periodValues.get(currentSeries.id) ?? 0) + options.value(row));
    values.set(period, periodValues);
  }

  const data = periods.map(period => {
    const row: Record<string, string | number> = { period };
    const periodValues = values.get(period);

    for (const key of series.keys()) {
      row[key] = periodValues?.get(key) ?? 0;
    }

    return row;
  });

  return {
    data,
    series: Array.from(series.entries()).map(([key, label]) => ({
      key,
      label,
      color: getLineColor(key)
    }))
  };
}
