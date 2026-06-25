"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = Record<string, string | number>;
type SeriesKey = { key: string; color: string; label: string };

export function TrendChart({ data, keys, height = 240 }: { data: Row[]; keys: SeriesKey[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k.key} id={`grad-${k.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={k.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={k.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "rgba(238,240,248,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(238,240,248,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={38} />
        <Tooltip
          contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#eef0f8" }}
        />
        {keys.map((k) => (
          <Area key={k.key} type="monotone" dataKey={k.key} name={k.label} stroke={k.color} strokeWidth={2} fill={`url(#grad-${k.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
