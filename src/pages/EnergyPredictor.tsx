import { useState } from "react";
import { Car, DollarSign, Leaf, Smartphone, Zap } from "lucide-react";
import { AreaCmp, BarCmp } from "../charts";
import { Btn, Card, CustomFields, Empty, ErrorBox, Num, PageHeader, Select, Stat } from "../components/ui";
import { useCall } from "../hooks/useCall";
import { post } from "../services/api";
import { C, DEVICES, MODELS } from "../utils/constants";

export default function EnergyPredictor() {
  const [f, setF] = useState({ model: "ResNet50", device: "Jetson Nano", epochs: 10, batch_size: 32, params_m: 10, gflops: 5, accuracy: 75 });
  const c = useCall((b: any) => post("/predict-energy", b));
  const r = c.data;
  return (
    <div>
      <PageHeader title="Energy Consumption Predictor" sub="Estimate energy, electricity cost, carbon footprint and sustainability for training or fine-tuning runs." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <Select label="Model type" value={f.model} onChange={(v: string) => setF({ ...f, model: v })} options={MODELS} />
          <CustomFields f={f} set={setF} />
          <Select label="Device type" value={f.device} onChange={(v: string) => setF({ ...f, device: v })} options={DEVICES} />
          <div className="grid grid-cols-2 gap-3"><Num label="Epochs" value={f.epochs} min={1} onChange={(v: number) => setF({ ...f, epochs: v })} /><Num label="Batch size" value={f.batch_size} min={1} onChange={(v: number) => setF({ ...f, batch_size: v })} /></div>
          <Btn loading={c.loading} onClick={() => c.run(f)}>Predict energy</Btn><ErrorBox msg={c.error} />
        </Card>
        {!r ? <Empty text="Enter training settings to estimate environmental impact." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat icon={Zap} label="Energy usage" value={r.energy_kwh} unit="kWh" /><Stat icon={DollarSign} label="Electricity cost" value={`$${r.cost_usd}`} />
              <Stat icon={Leaf} label="Carbon footprint" value={r.co2_kg} unit="kg CO₂" /><Stat icon={Leaf} label="Sustainability score" value={r.sustainability} unit="/100" /></div>
            <Card><p className="text-sm">Training takes about <b className="text-ink">{r.hours} h</b>. That equals driving roughly <b className="text-ink">{r.equivalents.km_driven} km</b> or charging a phone <b className="text-ink">{r.equivalents.phone_charges}</b> times.</p>
              <p className="mt-2 text-xs text-muted">{r.assumptions}</p></Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card><h3 className="mb-4 font-semibold">Cumulative energy by epoch (kWh)</h3><AreaCmp data={r.curve} x="epoch" series={[{ key: "kwh", name: "kWh", color: C.success }]} /></Card>
              <Card><h3 className="mb-4 font-semibold">CO₂ by device (kg, same workload)</h3><BarCmp data={r.by_device} x="device" bars={[{ key: "co2", name: "kg CO₂", color: C.warn }]} /></Card></div>
          </div>)}
      </div>
    </div>
  );
}
