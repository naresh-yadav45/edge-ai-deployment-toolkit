import { useState } from "react";
import { Flame, Timer, Zap } from "lucide-react";
import { BarCmp } from "../charts";
import { Badge, Btn, Card, CustomFields, Empty, ErrorBox, Meter, PageHeader, Select, Stat } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { post } from "../services/api";
import { C, DEVICES, METHODS, MODELS } from "../utils/constants";

export default function DeviceSimulator() {
  const [f, setF] = useState({ model: "MobileNetV2", device: "Raspberry Pi 5", method: "None", params_m: 10, gflops: 5, accuracy: 75 });
  const c = useCall((b: any) => post("/simulate-device", b));
  const r = c.data, s = r?.selected;
  return (
    <div>
      <PageHeader title="Device Simulator" sub="Simulate RAM, CPU, GPU, energy, latency and thermal behaviour on real edge hardware." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          <Select label="Device" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={DEVICES} />
          <Select label="Optimization" value={f.method} onChange={(v: string) => setF({ ...f, method: v })} options={["None", ...METHODS]} />
          <Btn loading={c.loading} onClick={() => c.run({ ...f, method: f.method === "None" ? null : f.method })}>Run simulation</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Choose a model and device to simulate deployment." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat icon={Timer} label="Latency" value={s.latency_ms} unit={`ms · ${s.fps} FPS`} /><Stat icon={Zap} label="Energy / inference" value={s.energy_mj} unit="mJ" />
              <Stat icon={Flame} label="Thermal estimate" value={s.thermal_c} unit="°C" /></div>
            <Card><div className="flex items-center justify-between"><h3 className="font-semibold">{r.device} resource usage</h3><Badge ok={s.fits}>{s.fits ? "Fits in RAM" : "Out of RAM"}</Badge></div>
              <div className="mt-5 grid gap-5 sm:grid-cols-3"><Meter label="RAM" value={Math.min(100, s.ram_pct)} color={s.fits ? C.primary : C.danger} />
                <Meter label="CPU" value={s.cpu_pct} color={C.success} /><Meter label="GPU" value={s.gpu_pct} color={C.warn} /></div>
              <ul className="mt-5 space-y-1 text-sm">{r.notes.map((n: string) => <li key={n}>• {n}</li>)}</ul></Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card><h3 className="mb-4 font-semibold">Latency by device (ms, log)</h3><BarCmp data={r.comparison} x="device" bars={[{ key: "latency_ms", name: "Latency (ms)" }]} log /></Card>
              <Card><h3 className="mb-4 font-semibold">Energy per inference (mJ, log)</h3><BarCmp data={r.comparison} x="device" bars={[{ key: "energy_mj", name: "Energy (mJ)", color: C.success }]} log /></Card>
              <Card className="lg:col-span-2"><h3 className="mb-4 font-semibold">Thermal estimate (°C)</h3><BarCmp data={r.comparison} x="device" bars={[{ key: "thermal_c", name: "Temperature (°C)", color: C.warn }]} h={220} /></Card>
            </div>
          </div>)}
      </div>
    </div>
  );
}
