import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Battery, Cpu, FlaskConical, Gauge, Sparkles, CheckCircle2 } from "lucide-react";

const FEATURES = [
  { icon: Gauge, t: "AI Model Analysis", d: "Parameters, FLOPs, memory, latency and a readiness score for each model." },
  { icon: Cpu, t: "Device Performance Simulation", d: "Raspberry Pi, Jetson, Android, ESP32 and STM32 side by side." },
  { icon: FlaskConical, t: "Optimization Lab", d: "Quantization, pruning, distillation and more, compared before and after." },
  { icon: Battery, t: "Energy Prediction", d: "Energy, cost and carbon footprint for your training runs." },
  { icon: Sparkles, t: "Deployment Recommendations", d: "The best device and optimization for your priority, with reasoning." },
  { icon: BarChart3, t: "Benchmark Center", d: "Head-to-head model comparisons on accuracy, size, speed and power." },
];

function Illustration() {
  return (
    <svg viewBox="0 0 480 380" className="w-full" role="img" aria-label="Edge AI chip with performance metrics">
      <rect x="150" y="110" width="180" height="180" rx="28" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      <rect x="190" y="150" width="100" height="100" rx="16" fill="#2563EB" />
      <text x="240" y="208" textAnchor="middle" fill="#fff" fontWeight="700" fontSize="22">AI</text>
      {[0, 1, 2, 3, 4].map((i) => <g key={i} stroke="#94A3B8" strokeWidth="3" strokeLinecap="round">
        <line x1={175 + i * 32} y1="110" x2={175 + i * 32} y2="86" /><line x1={175 + i * 32} y1="290" x2={175 + i * 32} y2="314" />
        <line x1="150" y1={135 + i * 32} x2="126" y2={135 + i * 32} /><line x1="330" y1={135 + i * 32} x2="354" y2={135 + i * 32} /></g>)}
      <g transform="translate(20,30)"><rect width="130" height="62" rx="14" fill="#fff" stroke="#E2E8F0" /><text x="14" y="26" fontSize="11" fill="#64748B">Latency</text><text x="14" y="48" fontSize="20" fontWeight="600" fill="#0F172A">24 ms</text></g>
      <g transform="translate(330,50)"><rect width="130" height="62" rx="14" fill="#fff" stroke="#E2E8F0" /><text x="14" y="26" fontSize="11" fill="#64748B">Readiness</text><text x="14" y="48" fontSize="20" fontWeight="600" fill="#10B981">92%</text></g>
      <g transform="translate(300,320)"><rect width="150" height="46" rx="14" fill="#fff" stroke="#E2E8F0" /><text x="14" y="28" fontSize="12" fill="#0F172A">INT8 · 6.1 W · 152 mJ</text></g>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">Deploy AI Models on Edge Devices with Confidence.</h1>
          <p className="mt-5 max-w-xl text-lg text-body">Analyze latency, memory usage, power consumption, optimization strategies, and deployment readiness using an enterprise-grade Edge AI platform.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyzer" className="btn-primary">Start Analysis <ArrowRight size={16} /></Link>
            <Link to="/benchmark" className="btn-ghost">View Benchmarks</Link>
          </div>
        </motion.div>
        <div className="rounded-3xl bg-surface p-6"><Illustration /></div>
      </section>
      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-primary"><f.icon size={20} /></div>
            <h3 className="mt-4 flex items-center gap-2 font-semibold"><CheckCircle2 size={16} className="text-success" />{f.t}</h3>
            <p className="mt-2 text-sm text-muted">{f.d}</p>
          </div>))}
      </section>
    </div>
  );
}
