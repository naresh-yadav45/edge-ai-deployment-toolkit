import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { Spark } from "../charts";
import { C } from "../utils/constants";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`card p-6 ${className}`}>{children}</div>;

export const PageHeader = ({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1><p className="mt-1.5 max-w-2xl text-sm text-muted">{sub}</p></div>{action}
  </div>
);

export function Kpi({ icon: Icon, label, value, delta = 0, insight, data = [], color = C.primary, invert = false }: any) {
  const good = invert ? delta <= 0 : delta >= 0;
  return (
    <motion.div whileHover={{ y: -3 }} className="card p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50"><Icon size={19} color={color} /></div>
        <span className={`text-xs font-semibold ${good ? "text-success" : "text-danger"}`}>{delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%</span>
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <div className="-mx-1 mt-2 h-10"><Spark data={data} color={color} /></div>
      <p className="mt-1 text-xs text-muted">{insight}</p>
    </motion.div>
  );
}

export const Stat = ({ icon: Icon, label, value, unit }: any) => (
  <div className="card flex items-center gap-4 p-4">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-primary"><Icon size={18} /></div>
    <div><p className="text-xs text-muted">{label}</p><p className="text-lg font-semibold text-ink">{value}<span className="ml-1 text-xs font-normal text-muted">{unit}</span></p></div>
  </div>
);

export const Meter = ({ label, value, color = C.primary, suffix = "%" }: any) => (
  <div>
    <div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium text-ink">{value}{suffix}</span></div>
    <div className="mt-1.5 h-2 rounded-full bg-slate-100"><motion.div className="h-2 rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
  </div>
);

export const Select = ({ label, value, onChange, options }: any) => (
  <label className="block"><span className="text-xs font-medium text-muted">{label}</span>
    <select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o: string) => <option key={o}>{o}</option>)}</select></label>
);

export const Num = ({ label, value, onChange, min = 0, step = 1 }: any) => (
  <label className="block"><span className="text-xs font-medium text-muted">{label}</span>
    <input type="number" min={min} step={step} className="input mt-1" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>
);

export const Btn = ({ loading, children, ...p }: any) => (
  <button className="btn-primary" disabled={loading} {...p}>{loading && <Loader2 size={16} className="animate-spin" />}{children}</button>
);

export const ErrorBox = ({ msg }: { msg: string }) => msg ? (
  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-danger"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{msg}</div>) : null;

export const Loader = () => <div className="grid h-64 place-items-center text-muted"><Loader2 className="animate-spin" /></div>;

export const Empty = ({ text }: { text: string }) => (
  <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">{text}</div>);

export const Badge = ({ ok, children }: any) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ok ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"}`}>{children}</span>);

export const CustomFields = ({ f, set }: any) => f.model === "Custom Model" ? (
  <div className="grid grid-cols-3 gap-3">
    <Num label="Params (M)" value={f.params_m} onChange={(v: number) => set({ ...f, params_m: v })} step={0.1} />
    <Num label="GFLOPs" value={f.gflops} onChange={(v: number) => set({ ...f, gflops: v })} step={0.1} />
    <Num label="Accuracy %" value={f.accuracy} onChange={(v: number) => set({ ...f, accuracy: v })} />
  </div>) : null;
