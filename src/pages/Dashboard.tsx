import { useEffect, useState } from "react";
import { Activity, BatteryCharging, Cpu, Gauge, Timer, Lightbulb, History } from "lucide-react";
import { Card, Kpi, Loader, PageHeader } from "../components/ui";
import { AreaCmp, BarCmp, LineCmp, PieCmp, RadarCmp } from "../charts";
import { get } from "../services/api";
import { C } from "../utils/constants";

export default function Dashboard() {
  const [d, setD] = useState<any>(null); const [err, setErr] = useState("");
  useEffect(() => { get("/history").then(setD).catch(() => setErr("Cannot reach the API. Start the backend on port 8000.")); }, []);
  if (err) return <p className="text-danger">{err}</p>;
  if (!d) return <Loader />;
  const s = d.summary;
  return (
    <div>
      <PageHeader title="Dashboard" sub="Live overview of analyses, simulations and deployment health across your projects." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={Gauge} label="Models Analyzed" value={s.models_analyzed} delta={s.deltas.models} data={s.sparks.models} insight="Analyses saved to history" />
        <Kpi icon={Cpu} label="Device Simulations" value={s.simulations} delta={s.deltas.sims} data={s.sparks.sims} color={C.success} insight="Across 7 device targets" />
        <Kpi icon={Timer} label="Average Latency" value={`${s.avg_latency} ms`} delta={s.deltas.latency} data={s.sparks.latency} color={C.warn} invert insight="Simulations that fit in RAM" />
        <Kpi icon={BatteryCharging} label="Average Power" value={`${s.avg_power} W`} delta={s.deltas.power} data={s.sparks.power} color={C.danger} invert insight="Sustained inference draw" />
        <Kpi icon={Activity} label="Deployment Success" value={`${s.success_score}%`} delta={s.deltas.success} data={s.sparks.success} insight="Mean readiness score" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-4 font-semibold">Average latency by device (ms, log scale)</h3><BarCmp data={s.latency_by_device} x="name" bars={[{ key: "latency", name: "Latency (ms)" }]} log /></Card>
        <Card><h3 className="mb-4 font-semibold">Activity, last 7 days</h3><AreaCmp data={s.activity} x="day" series={[{ key: "runs", name: "Runs" }]} /></Card>
        <Card><h3 className="mb-4 font-semibold">Power trend (W)</h3><LineCmp data={s.power_trend} x="name" series={[{ key: "power", name: "Power (W)", color: C.danger }]} /></Card>
        <Card><h3 className="mb-4 font-semibold">Models analysed</h3><PieCmp data={s.model_mix} /></Card>
        <Card><h3 className="mb-4 font-semibold">Average capability profile</h3><RadarCmp data={s.radar} series={[{ key: "score", name: "Score" }]} /></Card>
        <Card className="space-y-6">
          <div><h3 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb size={16} className="text-warn" />Real-time insights</h3>
            <ul className="space-y-2 text-sm">{s.insights.map((x: string) => <li key={x}>• {x}</li>)}</ul></div>
          <div><h3 className="mb-3 font-semibold">Recommendations</h3>
            <ul className="space-y-2 text-sm">{s.recommendations.map((x: string) => <li key={x}>• {x}</li>)}</ul></div>
        </Card>
      </div>
      <Card className="mt-6"><h3 className="mb-4 flex items-center gap-2 font-semibold"><History size={16} />Recent analyses</h3>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-muted"><tr><th className="pb-2">Type</th><th>Item</th><th>When (UTC)</th></tr></thead>
          <tbody>{d.items.slice(0, 8).map((r: any) => <tr key={r.type + r.id} className="border-t border-line"><td className="py-2.5 font-medium text-ink">{r.type}</td><td>{r.label}</td><td className="text-muted">{r.created_at}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}
