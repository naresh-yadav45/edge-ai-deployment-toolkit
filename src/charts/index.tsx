import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C, PALETTE } from "../utils/constants";

const tip = { contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px -12px rgba(15,23,42,.2)", fontSize: 12 } };
const axis = { stroke: "#94A3B8", fontSize: 11, tickLine: false, axisLine: false } as const;
const grid = <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />;
type Series = { key: string; name?: string; color?: string };

export function Spark({ data = [], color = C.primary }: { data?: number[]; color?: string }) {
  const d = data.slice(-16).map((v) => ({ v }));
  if (d.length < 2) return <div className="h-full" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={d}><defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g${color.slice(1)})`} isAnimationActive={false} /></AreaChart>
    </ResponsiveContainer>
  );
}

export function BarCmp({ data, x, bars, h = 260, log = false }: { data: any[]; x: string; bars: Series[]; h?: number; log?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} margin={{ left: -8, right: 8 }}>{grid}<XAxis dataKey={x} {...axis} interval={0} tick={{ fontSize: 10, fill: "#94A3B8" }} />
        <YAxis {...axis} scale={log ? "log" : "auto"} domain={log ? [1, "auto"] : [0, "auto"]} allowDataOverflow /><Tooltip {...tip} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b, i) => <Bar key={b.key} dataKey={b.key} name={b.name || b.key} fill={b.color || PALETTE[i]} radius={[6, 6, 0, 0]} maxBarSize={36} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AreaCmp({ data, x, series, h = 240 }: { data: any[]; x: string; series: Series[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data} margin={{ left: -8, right: 8 }}>{grid}<XAxis dataKey={x} {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
        {series.map((s, i) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || PALETTE[i]} fill={s.color || PALETTE[i]} fillOpacity={0.12} strokeWidth={2} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineCmp({ data, x, series, h = 240 }: { data: any[]; x: string; series: Series[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={data} margin={{ left: -8, right: 8 }}>{grid}<XAxis dataKey={x} {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
        {series.map((s, i) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || PALETTE[i]} strokeWidth={2.5} dot={{ r: 3 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieCmp({ data, h = 240 }: { data: { name: string; value: number }[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <PieChart><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie></PieChart>
    </ResponsiveContainer>
  );
}

export function RadarCmp({ data, series, h = 260 }: { data: any[]; series: Series[]; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <RadarChart data={data}><PolarGrid stroke="#E2E8F0" /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748B" }} /><Tooltip {...tip} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => <Radar key={s.key} dataKey={s.key} name={s.name || s.key} stroke={s.color || PALETTE[i]} fill={s.color || PALETTE[i]} fillOpacity={0.18} />)}
      </RadarChart>
    </ResponsiveContainer>
  );
}
