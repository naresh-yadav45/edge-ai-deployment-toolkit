import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Cpu, Gauge, LayoutDashboard, Leaf, FlaskConical, BarChart3, BookOpen, FileText, Settings, Menu, X, Sparkles, Layers, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const SIDE = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { to: "/analyzer", label: "Model Analyzer", icon: Gauge },
  { to: "/simulator", label: "Device Simulator", icon: Cpu }, { to: "/optimization", label: "Optimization Lab", icon: FlaskConical },
  { to: "/energy", label: "Energy Predictor", icon: Leaf }, { to: "/recommend", label: "Recommendations", icon: Sparkles },
  { to: "/benchmark", label: "Benchmark Center", icon: BarChart3 }, { to: "/research", label: "Research Hub", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileText }, { to: "/settings", label: "Settings", icon: Settings },
];
const TOP = ["/dashboard", "/analyzer", "/simulator", "/optimization", "/energy", "/benchmark", "/research", "/reports"];

export default function AppLayout() {
  const { pathname } = useLocation();
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const home = pathname === "/";
  const link = (a: boolean) => `rounded-lg px-3 py-1.5 text-sm transition ${a ? "bg-blue-50 font-medium text-primary" : "text-body hover:bg-surface hover:text-ink"}`;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          {!home && <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>}
          <Link to="/" className="flex items-center gap-2 font-semibold text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Zap size={17} /></span>Edge AI Toolkit</Link>
          <nav className="ml-4 hidden flex-1 gap-1 xl:flex">
            {SIDE.filter((s) => TOP.includes(s.to)).map((s) => <NavLink key={s.to} to={s.to} className={({ isActive }) => link(isActive)}>{s.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface" aria-label="Notifications"><Bell size={18} /></button>
            <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface" aria-label="Settings"><Settings size={18} /></Link>
            {user ? <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white" title={user.name}>{user.name[0].toUpperCase()}</Link>
                  : <Link to="/auth" className="btn-primary !py-2">Sign in</Link>}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1500px]">
        {!home && (
          <aside className={`${open ? "fixed inset-x-0 top-16 z-20 block bg-white shadow-xl" : "hidden"} w-full shrink-0 border-r border-line p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-64`}>
            <nav className="flex flex-col gap-1">
              {SIDE.map((s) => (
                <NavLink key={s.to} to={s.to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? "bg-blue-50 font-medium text-primary" : "text-body hover:bg-surface"}`}>
                  <s.icon size={18} />{s.label}</NavLink>))}
            </nav>
            <div className="mt-6 rounded-2xl bg-surface p-4 text-xs text-muted"><Layers size={16} className="mb-2 text-primary" />Estimates come from an analytical model. Validate on real hardware before production.</div>
          </aside>)}
        <motion.main key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
