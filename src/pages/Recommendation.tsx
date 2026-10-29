import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Btn, Card, CustomFields, Empty, ErrorBox, Num, PageHeader, Select, Stat } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { post } from "../services/api";
import { DEVICES, METHODS, MODELS } from "../utils/constants";
import { Cpu, Timer, Zap, Wallet } from "lucide-react";

export default function Recommendation() {
  const [f, setF] = useState({ model: "MobileNetV2", device: "Any", method: "Any", priority: "balanced", units: 100, hours_per_day: 24, params_m: 10, gflops: 5, accuracy: 75 });
  const c = useCall((b: any) => post("/recommend-device", b));
  const r = c.data;
  const any = (v: string) => (v === "Any" ? null : v);
  return (
    <div>
      <PageHeader title="Deployment Recommendations" sub="Get the best device and optimization strategy for your model, with reasoning and a cost estimate." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          <Select label="Device" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={["Any", ...DEVICES]} />
          <Select label="Optimization method" value={f.method} onChange={(v: string) => setF({ ...f, method: v })} options={["Any", ...METHODS]} />
          <Select label="Priority" value={f.priority} onChange={(v: string) => setF({ ...f, priority: v })} options={["balanced", "latency", "power", "cost"]} />
          <div className="grid grid-cols-2 gap-3"><Num label="Units" value={f.units} min={1} onChange={(v: number) => setF({ ...f, units: v })} /><Num label="Hours / day" value={f.hours_per_day} min={1} onChange={(v: number) => setF({ ...f, hours_per_day: v })} /></div>
          <Btn loading={c.loading} onClick={() => c.run({ ...f, device: any(f.device), method: any(f.method) })}>Recommend</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Set your constraints and priority to get a recommendation." /> : (
          <div className="space-y-6">
            <Card className={r.feasible ? "border-blue-200 bg-blue-50/40" : ""}><p className="text-sm text-muted">Recommendation</p><p className="mt-2 text-lg font-medium text-ink">{r.headline}</p></Card>
            {r.feasible && <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={Cpu} label="Recommended device" value={r.recommended_device} /><Stat icon={Zap} label="Strategy" value={r.recommended_method} />
                <Stat icon={Timer} label="Estimated latency" value={r.estimated_performance.latency_ms} unit="ms" /><Stat icon={Zap} label="Expected power" value={r.expected_power_w} unit="W" /></div>
              <Card><h3 className="mb-3 font-semibold">Why this choice</h3><ul className="space-y-2 text-sm">{r.reasoning.map((x: string) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />{x}</li>)}</ul></Card>
              <Card><h3 className="mb-3 flex items-center gap-2 font-semibold"><Wallet size={16} />Deployment cost calculator ({r.cost.units} units)</h3>
                <div className="grid gap-4 text-sm sm:grid-cols-4">{[["Hardware", `$${r.cost.hardware_usd}`], ["Energy / year", `${r.cost.energy_kwh_year} kWh`], ["Energy cost / year", `$${r.cost.energy_cost_year_usd}`], ["3-year TCO", `$${r.cost.tco_3y_usd}`]].map(([k, v]) =>
                  <div key={k}><p className="text-xs text-muted">{k}</p><p className="text-lg font-semibold text-ink">{v}</p></div>)}</div></Card>
              <Card><h3 className="mb-3 font-semibold">Alternatives</h3><table className="w-full text-left text-sm"><thead className="text-xs text-muted"><tr><th className="pb-2">Device</th><th>Method</th><th>Latency</th><th>Power</th><th>Score</th></tr></thead>
                <tbody>{r.alternatives.map((a: any) => <tr key={a.device + a.label} className="border-t border-line"><td className="py-2.5 font-medium text-ink">{a.device}</td><td>{a.label}</td><td>{a.metrics.latency_ms} ms</td><td>{a.metrics.power_w} W</td><td>{a.score}</td></tr>)}</tbody></table></Card></>}
          </div>)}
      </div>
    </div>
  );
}
