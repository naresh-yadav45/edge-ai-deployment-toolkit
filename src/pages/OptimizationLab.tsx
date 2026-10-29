import { useState } from "react";
import { BarCmp } from "../charts";
import { Btn, Card, CustomFields, Empty, ErrorBox, Meter, PageHeader, Select } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { post } from "../services/api";
import { C, DEVICES, METHODS, MODELS } from "../utils/constants";

export default function OptimizationLab() {
  const [f, setF] = useState({ model: "ResNet50", method: "Quantization", device: "Raspberry Pi 5", params_m: 10, gflops: 5, accuracy: 75 });
  const c = useCall((b: any) => post("/optimize-model", b));
  const r = c.data;
  const rows = r ? [["Model size", "MB", "size_mb", r.gains.size], ["Accuracy", "pts", "accuracy", -r.gains.accuracy_drop], ["Latency", "ms", "latency_ms", r.gains.latency],
                    ["Memory", "MB", "ram_mb", r.gains.memory], ["Power", "W", "power_w", r.gains.power]] : [];
  return (
    <div>
      <PageHeader title="Optimization Lab" sub="Compare quantization, pruning, distillation, compression and conversion before and after." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          <Select label="Method" value={f.method} onChange={(v: string) => setF({ ...f, method: v })} options={METHODS} />
          <Select label="Target device" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={DEVICES} />
          <Btn loading={c.loading} onClick={() => c.run(f)}>Optimize</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Select a method to see before and after metrics." /> : (
          <div className="space-y-6">
            <Card><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted">Optimization score · {r.label}</p>
              <p className="text-5xl font-semibold text-primary">{r.score}<span className="text-lg text-muted">/100</span></p></div>
              <div className="min-w-[240px] flex-1 space-y-3 sm:max-w-sm"><Meter label="Size reduction" value={r.gains.size} color={C.primary} /><Meter label="Latency reduction" value={r.gains.latency} color={C.success} />
                <Meter label="Power reduction" value={r.gains.power} color={C.warn} /></div></div></Card>
            <Card><h3 className="mb-4 font-semibold">Before vs after</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="text-xs text-muted"><tr><th className="pb-2">Metric</th><th>Before</th><th>After</th><th>Change</th></tr></thead><tbody>
                {rows.map(([n, u, k, g]: any) => <tr key={n} className="border-t border-line"><td className="py-2.5 font-medium text-ink">{n}</td><td>{r.before[k]} {u}</td><td>{r.after[k]} {u}</td>
                  <td className={g >= 0 ? "text-success" : "text-danger"}>{g >= 0 ? "↓" : "↑"} {Math.abs(g)}{n === "Accuracy" ? " pts" : "%"}</td></tr>)}</tbody></table></div></Card>
            <Card><h3 className="mb-4 font-semibold">All methods compared (gains %, score)</h3>
              <BarCmp data={r.all_methods} x="method" bars={[{ key: "size", name: "Size %", color: C.primary }, { key: "latency", name: "Latency %", color: C.success }, { key: "power", name: "Power %", color: C.warn }, { key: "score", name: "Score", color: "#8B5CF6" }]} /></Card>
          </div>)}
      </div>
    </div>
  );
}
