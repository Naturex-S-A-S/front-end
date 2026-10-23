"use client";

import { useTheme } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompact } from "@/utils/reports/format";

interface Props {
  data: Array<{ name: string; value: number; color: string }>;
  valueFormatter: (value: number) => string;
  height?: number;
}

const truncate = (value: string): string => (value.length > 28 ? `${value.slice(0, 27)}…` : value);

export default function HorizontalBarChart({ data, valueFormatter, height = 360 }: Props) {
  const theme = useTheme();

  return (
    <div role='img' aria-label='Top de productos vendidos' style={{ width: "100%", height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} layout='vertical' margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' horizontal={false} />
          <XAxis
            type='number'
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={formatCompact}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type='category'
            dataKey='name'
            width={200}
            tickFormatter={truncate}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
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
          <Bar dataKey='value' name='Valor' isAnimationActive={false}>
            {data.map(item => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
