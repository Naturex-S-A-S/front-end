"use client";

import { useState } from "react";

import { Chip, Stack, useTheme } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompact } from "@/utils/reports/format";

interface Props {
  data: Array<{
    periodLabel: string;
    current: number;
    previous: number;
    currentCumulative: number;
    previousCumulative: number;
  }>;
  valueFormatter: (value: number) => string;
  height?: number;
  ariaLabel?: string;
}

const COLORS = {
  current: "#1E88E5",
  previous: "#F4511E"
};

const LINES = [
  { key: "current", label: "Actual", color: COLORS.current, dashed: false },
  { key: "previous", label: "Anterior", color: COLORS.previous, dashed: false },
  { key: "currentCumulative", label: "Acumulado actual", color: COLORS.current, dashed: true },
  { key: "previousCumulative", label: "Acumulado anterior", color: COLORS.previous, dashed: true }
];

export default function LineComparisonChart({
  data,
  valueFormatter,
  height = 360,
  ariaLabel = "Comparación de volumen contra el período anterior"
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

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
        {LINES.map(item => (
          <Chip
            key={item.key}
            size='small'
            variant='outlined'
            label={item.label}
            onClick={() => toggleSeries(item.key)}
            sx={{
              borderColor: item.color,
              color: item.color,
              opacity: hiddenSeries.has(item.key) ? 0.35 : 1
            }}
          />
        ))}
      </Stack>
      <div role='img' aria-label={ariaLabel} style={{ width: "100%", height }}>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey='periodLabel'
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
              formatter={value =>
                value == null ? "" : Array.isArray(value) ? value.join(" - ") : valueFormatter(Number(value))
              }
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary
              }}
            />
            {LINES.map(item => (
              <Line
                key={item.key}
                type='monotone'
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={item.dashed ? "5 5" : undefined}
                dot={false}
                hide={hiddenSeries.has(item.key)}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Stack>
  );
}
