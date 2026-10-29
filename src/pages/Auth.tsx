import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Btn, ErrorBox } from "../components/ui";
import { post } from "../services/api";
import { setSession } from "../hooks/useAuth";

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [f, setF] = useState({ name: "", email: "", password: "", token: "" });
  const [err, setErr] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg(""); setBusy(true);
    try {
      if (mode === "forgot") {
        if (f.token) { const r = await post("/auth/reset-password", { token: f.token, password: f.password }); setMsg(r.message); setMode("login"); }
        else { const r = await post("/auth/forgot-password", { email: f.email }); setMsg(r.message); if (r.reset_token) setF({ ...f, token: r.reset_token }); }
      } else {
        const r = await post(`/auth/${mode}`, mode === "login" ? { email: f.email, password: f.password } : f);
        setSession(r.token); nav("/dashboard");
      }
    } catch (x: any) {
      const d = x?.response?.data?.detail; setErr(typeof d === "string" ? d : "Please check your details (password needs 6+ characters).");
    } finally { setBusy(false); }
  }
  const title = { login: "Welcome back", register: "Create your account", forgot: f.token ? "Choose a new password" : "Reset your password" }[mode];
  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted">Sign in to save analyses, reports and history.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <input className="input" placeholder="Full name" value={f.name} onChange={set("name")} required />}
          {!f.token && <input className="input" type="email" placeholder="Email" value={f.email} onChange={set("email")} required />}
          {(mode !== "forgot" || f.token) && <input className="input" type="password" placeholder={f.token ? "New password" : "Password"} value={f.password} onChange={set("password")} required minLength={6} />}
          {f.token && <p className="break-all rounded-xl bg-surface p-3 text-xs text-muted">Demo mode: reset token generated and filled in for you.</p>}
          <Btn loading={busy} type="submit">{mode === "login" ? "Sign in" : mode === "register" ? "Create account" : f.token ? "Update password" : "Get reset token"}</Btn>
        </form>
        {msg && <p className="mt-4 text-sm text-success">{msg}</p>}<ErrorBox msg={err} />
        <div className="mt-6 flex justify-between text-sm text-primary">
          <button onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create account" : "Back to sign in"}</button>
          {mode === "login" && <button onClick={() => setMode("forgot")}>Forgot password?</button>}
        </div>
      </Card>
    </div>
  );
}
