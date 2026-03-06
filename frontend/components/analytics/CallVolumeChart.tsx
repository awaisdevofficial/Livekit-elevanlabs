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
import { format, parseISO } from "date-fns";

interface DataPoint {
  date: string;
  count?: number;
  calls?: number;
}

export function CallVolumeChart({ data }: { data: DataPoint[] }) {
  const dataKey = data.length && (data[0].calls !== undefined || (data[0] as any).calls !== undefined) ? "calls" : "count";

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4DFFCE" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4DFFCE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => {
              try {
                if (typeof v === "string" && v.length >= 10) return format(parseISO(v), "MMM d");
              } catch {}
              return v;
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(14,17,22,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
            labelFormatter={(v) => {
              try {
                if (typeof v === "string" && v.length >= 10) return format(parseISO(v), "MMMM d, yyyy");
              } catch {}
              return String(v);
            }}
            formatter={(v: number) => [v, "Calls"]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#4DFFCE"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCalls)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
