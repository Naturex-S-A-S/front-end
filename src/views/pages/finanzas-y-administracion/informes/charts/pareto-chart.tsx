"use client";

import { useTheme } from "@mui/material";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCompactCop, formatCop, formatPct } from "@/utils/reports/format";

interface Props {
  data: Array<{ name: string; value: number; cumulativePct: number | null }>;
  height?: number;
}

const PARETO_CUT_PCT = 80;

const truncate = (value: string): string => (value.length > 16 ? `${value.slice(0, 15)}…` : value);

export default function ParetoChart({ data, height = 380 }: Props) {
  const theme = useTheme();

  return (
    <div role='img' aria-label='Utilidad neta por producto y curva de Pareto' style={{ width: "100%", height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 48 }}>
          <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='name'
            interval={0}
            angle={-35}
            textAnchor='end'
            height={56}
            tickFormatter={truncate}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <YAxis
            yAxisId='profit'
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={formatCompactCop}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId='cumulative'
            orientation='right'
            domain={[0, 100]}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={value => `${value}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: theme.palette.action.hover }}
            formatter={(value, name) => {
              if (value == null || Array.isArray(value)) return "";

              return name === "% acumulado" ? formatPct(Number(value)) : formatCop(Number(value));
            }}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary
            }}
          />
          <ReferenceLine
            yAxisId='cumulative'
            y={PARETO_CUT_PCT}
            stroke={theme.palette.text.secondary}
            strokeDasharray='4 4'
            label={{ value: "80 %", position: "insideTopRight", fill: theme.palette.text.secondary, fontSize: 11 }}
          />
          <Bar yAxisId='profit' dataKey='value' name='Utilidad neta' isAnimationActive={false}>
            {data.map(item => (
              <Cell
                key={item.name}
                fill={item.value < 0 ? theme.palette.error.main : theme.palette.primary.main}
              />
            ))}
          </Bar>
          <Line
            yAxisId='cumulative'
            type='monotone'
            dataKey='cumulativePct'
            name='% acumulado'
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
