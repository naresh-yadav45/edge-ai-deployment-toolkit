import { useState } from "react";
import { Trophy } from "lucide-react";
import { BarCmp, RadarCmp } from "../charts";
import { Btn, Card, Empty, ErrorBox, PageHeader, Select } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { post } from "../services/api";
import { C, DEVICES, MODELS } from "../utils/constants";

const PRESETS = [["MobileNetV2", "YOLOv8"], ["ResNet50", "EfficientNet"], ["BERT", "DistilBERT"]];

export default function Benchmark() {
  const [f, setF] = useState({ model: "MobileNetV2", compare_with: "YOLOv8", device: "Raspberry Pi 5" });
  const c = useCall((b: any) => post("/benchmark", b));
  const r = c.data;
  return (
    <div>
      <PageHeader title="Benchmark Center" sub="Head-to-head model comparisons on accuracy, size, speed, memory and power." />
      <div className="mb-4 flex flex-wrap gap-2">{PRESETS.map(([a, b]) => (
        <button key={a} className="btn-ghost !py-1.5" onClick={() => { const n = { ...f, model: a, compare_with: b }; setF(n); c.run(n); }}>{a} vs {b}</button>))}</div>
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model A" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS.filter((m) => m !== "Custom Model")} />
          <Select label="Model B" value={f.compare_with} onChange={(v: string) => setF({ ...f, compare_with: v })} options={MODELS.filter((m) => m !== "Custom Model")} />
          <Select label="Device" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={DEVICES} />
          <Btn loading={c.loading} onClick={() => c.run(f)}>Run benchmark</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Choose two models or a preset to compare." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">{r.ranking.map((x: any) => (
              <Card key={x.name} className={x.rank === 1 ? "border-blue-200 bg-blue-50/40" : ""}><div className="flex items-center justify-between"><p className="text-sm text-muted">Rank #{x.rank}</p>{x.rank === 1 && <Trophy size={18} className="text-warn" />}</div>
                <p className="mt-2 text-xl font-semibold text-ink">{x.name}</p><p className="text-3xl font-semibold text-primary">{x.score}<span className="text-sm text-muted"> / 100</span></p></Card>))}</div>
            <Card><h3 className="mb-4 font-semibold">Metrics on {r.device}</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="text-xs text-muted"><tr><th className="pb-2">Metric</th><th>{r.a.name}</th><th>{r.b.name}</th><th>Winner</th></tr></thead>
              <tbody>{r.table.map((t: any) => <tr key={t.metric} className="border-t border-line"><td className="py-2.5 font-medium text-ink">{t.metric}</td><td>{t.a} {t.unit}</td><td>{t.b} {t.unit}</td><td className="text-success">{t.winner}</td></tr>)}</tbody></table></div>
              <p className="mt-3 text-xs text-muted">{r.note}</p></Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card><h3 className="mb-4 font-semibold">Normalised score per metric</h3><BarCmp data={r.normalized} x="metric" bars={[{ key: "a", name: r.a.name, color: C.primary }, { key: "b", name: r.b.name, color: C.success }]} /></Card>
              <Card><h3 className="mb-4 font-semibold">Profile comparison</h3><RadarCmp data={r.normalized} series={[{ key: "a", name: r.a.name, color: C.primary }, { key: "b", name: r.b.name, color: C.success }]} /></Card></div>
          </div>)}
      </div>
    </div>
  );
}
