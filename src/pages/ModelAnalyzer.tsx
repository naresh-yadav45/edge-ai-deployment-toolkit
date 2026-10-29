import { useState } from "react";
import { Boxes, Database, Download, HardDrive, Gauge, Target, Timer, Zap } from "lucide-react";
import { BarCmp, RadarCmp } from "../charts";
import { Btn, Card, CustomFields, Empty, ErrorBox, PageHeader, Select, Stat } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { downloadReport, post } from "../services/api";
import { DEVICES, MODELS } from "../utils/constants";

export default function ModelAnalyzer() {
  const [f, setF] = useState({ model: "MobileNetV2", params_m: 10, gflops: 5, accuracy: 75 });
  const c = useCall((b: any) => post("/analyze-model", b));
  const r = c.data;
  const tone = r?.readiness >= 70 ? "text-success" : r?.readiness >= 40 ? "text-warn" : "text-danger";
  return (
    <div>
      <PageHeader title="AI Model Analyzer" sub="Estimate size, memory, latency and deployment readiness for popular edge models or your own." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          <Btn loading={c.loading} onClick={() => c.run(f)}>Analyze model</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Pick a model and run the analysis to see its edge profile." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Stat icon={Boxes} label="Parameters" value={r.params_m} unit="M" /><Stat icon={Zap} label="FLOPs" value={r.gflops} unit="GFLOPs" />
              <Stat icon={HardDrive} label="Model size" value={r.size_mb} unit="MB" /><Stat icon={Database} label="Memory requirement" value={r.mem_mb} unit="MB" />
              <Stat icon={Timer} label={`Latency (${r.reference_device})`} value={r.latency_ms} unit="ms" /><Stat icon={Target} label="Estimated accuracy" value={r.accuracy} unit="%" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card><p className="flex items-center gap-2 text-sm text-muted"><Gauge size={16} />Deployment readiness</p>
                <p className={`mt-2 text-5xl font-semibold ${tone}`}>{r.readiness}%</p><p className="mt-1 text-sm font-medium text-ink">{r.verdict}</p>
                <p className="mt-3 text-sm text-success">↑ {(r.readiness_optimized - r.readiness).toFixed(1)} points with {r.best_optimization}</p>
                <p className="mt-4 text-sm">{r.summary}</p></Card>
              <Card><h3 className="mb-2 font-semibold">Capability profile</h3><RadarCmp data={r.radar} series={[{ key: "score", name: r.model }]} /></Card>
            </div>
            <Card><h3 className="mb-4 font-semibold">Latency across devices (ms, log scale)</h3><BarCmp data={r.devices} x="device" bars={[{ key: "latency_ms", name: "Latency (ms)" }]} log />
              <div className="mt-4 flex flex-wrap gap-2 text-xs">{r.devices.map((d: any) => <span key={d.device} className={`rounded-full px-3 py-1 ${d.fits ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"}`}>{d.device}: {d.fits ? "fits" : "out of RAM"}</span>)}</div></Card>
            <button className="btn-ghost" onClick={() => downloadReport({ report_type: "deployment", format: "pdf", ...f, device: r.reference_device })}><Download size={16} />Download PDF analysis report</button>
          </div>)}
      </div>
    </div>
  );
}
