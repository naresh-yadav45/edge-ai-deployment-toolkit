import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { Btn, Card, CustomFields, ErrorBox, PageHeader, Select } from "../components/ui";
import { downloadReport, get } from "../services/api";
import { DEVICES, METHODS, MODELS } from "../utils/constants";

export default function Reports() {
  const [f, setF] = useState({ report_type: "deployment", model: "MobileNetV2", compare_with: "YOLOv8", device: "Raspberry Pi 5", method: "Quantization", params_m: 10, gflops: 5, accuracy: 75 });
  const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [past, setPast] = useState<any[]>([]);
  const load = () => get("/history").then((d) => setPast(d.items.filter((i: any) => i.type === "Report" && i.mine))).catch(() => {});
  useEffect(() => { load(); }, []);
  async function gen(format: string) {
    setBusy(format); setErr("");
    try { await downloadReport({ ...f, format }); load(); } catch (e: any) { setErr(e?.response ? "Could not generate the report. Check the inputs." : "Cannot reach the API."); }
    setBusy("");
  }
  return (
    <div>
      <PageHeader title="Reports" sub="Generate deployment, optimization and benchmark reports with charts, metrics and an executive summary." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Report type" value={f.report_type} onChange={(v: string) => setF({ ...f, report_type: v })} options={["deployment", "optimization", "benchmark"]} />
          <Select label="Model" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          {f.report_type === "benchmark" && <Select label="Compare with" value={f.compare_with} onChange={(v: string) => setF({ ...f, compare_with: v })} options={MODELS.filter((m) => m !== "Custom Model")} />}
          <Select label="Device" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={DEVICES} />
          {f.report_type === "optimization" && <Select label="Method" value={f.method} onChange={(v: string) => setF({ ...f, method: v })} options={METHODS} />}
          <div className="flex gap-3"><Btn loading={busy === "pdf"} onClick={() => gen("pdf")}><FileDown size={16} />PDF</Btn><button className="btn-ghost" disabled={!!busy} onClick={() => gen("csv")}>{busy === "csv" ? "Preparing" : "CSV"}</button></div>
          <ErrorBox msg={err} />
        </Card>
        <Card><h3 className="mb-4 font-semibold">Your saved reports</h3>
          {past.length === 0 ? <p className="text-sm text-muted">Sign in and generate a report to keep a history here.</p> :
            <ul className="divide-y divide-line text-sm">{past.map((p) => <li key={p.id} className="flex justify-between py-3"><span className="font-medium text-ink">{p.label}</span><span className="text-muted">{p.created_at}</span></li>)}</ul>}</Card>
      </div>
    </div>
  );
}
