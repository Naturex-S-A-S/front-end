"use client";

import { useState } from "react";

import { Chip, Stack, useTheme } from "@mui/material";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PivotSeries } from "@/utils/reports/pivot";
import { formatCompact } from "@/utils/reports/format";

interface Props {
  data: Array<Record<string, string | number>>;
  series: PivotSeries[];
  xKey: string;
  valueFormatter: (value: number) => string;
  height?: number;
  total?: PivotSeries;
  ariaLabel?: string;
}

export default function StackedBarChart({
  data,
  series,
  xKey,
  valueFormatter,
  height = 360,
  total,
  ariaLabel = "Gráfico de barras apiladas"
}: Props) {
  const theme = useTheme();
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (key: string) => {
    setHiddenSeries(current => {
      const next = new Set(current);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  };

  const legend = total ? [...series, total] : series;

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
        {legend.map(item => (
          <Chip
            key={item.key}
            size='small'
            label={item.label}
            onClick={() => toggleSeries(item.key)}
            sx={{
              bgcolor: item.color,
              color: "#fff",
              opacity: hiddenSeries.has(item.key) ? 0.35 : 1
            }}
          />
        ))}
      </Stack>
      <div role='img' aria-label={ariaLabel} style={{ width: "100%", height }}>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: theme.palette.action.hover }}
              formatter={value =>
                value == null ? "" : Array.isArray(value) ? value.join(" - ") : valueFormatter(Number(value))
              }
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary
              }}
            />
            {series.map(item => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                stackId='total'
                fill={item.color}
                hide={hiddenSeries.has(item.key)}
                isAnimationActive={false}
              />
            ))}
            {total && (
              <Line
                type='monotone'
                dataKey={total.key}
                name={total.label}
                stroke={total.color}
                strokeWidth={2}
                dot={false}
                hide={hiddenSeries.has(total.key)}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Stack>
  );
}
