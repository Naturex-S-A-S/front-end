"use client";

import { useTheme } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompact } from "@/utils/reports/format";

interface Props {
  data: Array<{ batch: string; expected: number; produced: number; loss: number }>;
  valueFormatter: (value: number) => string;
  height?: number;
}

const BARS = [
  { key: "expected", label: "Teórico", color: "#1E88E5" },
  { key: "produced", label: "Envasado", color: "#43A047" },
  { key: "loss", label: "Merma", color: "#F4511E" }
];

export default function GroupedBarChart({ data, valueFormatter, height = 380 }: Props) {
  const theme = useTheme();

  return (
    <div role='img' aria-label='Balance de masa por lote' style={{ width: "100%", height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
          <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='batch'
            interval={0}
            angle={-30}
            textAnchor='end'
            height={60}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
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
          {BARS.map(bar => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
