import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, GraduationCap, FileText } from "lucide-react";
import { Card, Loader, PageHeader } from "../components/ui";
import { get } from "../services/api";

export default function ResearchHub() {
  const [d, setD] = useState<any>(null); const [open, setOpen] = useState<string | null>(null); const [q, setQ] = useState("");
  useEffect(() => { get("/research-content").then(setD); }, []);
  if (!d) return <Loader />;
  const topics = d.topics.filter((t: any) => (t.title + t.summary + t.tag).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Research Hub" sub="Concise explanations of Edge AI, TinyML, accelerators and emerging compute, plus a reading list." />
      <input className="input mb-6 max-w-md" placeholder="Search topics" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{topics.map((t: any) => (
        <Card key={t.id} className="flex flex-col"><span className="w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary">{t.tag}</span>
          <h3 className="mt-3 text-lg font-semibold">{t.title}</h3><p className="mt-2 text-sm">{t.summary}</p>
          <button className="mt-4 flex items-center gap-1 text-sm font-medium text-primary" onClick={() => setOpen(open === t.id ? null : t.id)}>{open === t.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}{open === t.id ? "Hide details" : "Explore"}</button>
          {open === t.id && <div className="mt-4 space-y-4"><ul className="space-y-1.5 text-sm">{t.points.map((p: string) => <li key={p}>• {p}</li>)}</ul>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-surface p-3 text-xs">{t.diagram.map((s: string, i: number) => <span key={s} className="flex items-center gap-1.5"><span className="rounded-lg border border-line bg-white px-2 py-1 text-ink">{s}</span>{i < t.diagram.length - 1 && <ChevronRight size={12} className="text-muted" />}</span>)}</div></div>}
        </Card>))}</div>
      <h2 className="mb-4 mt-10 flex items-center gap-2 text-xl font-semibold"><FileText size={18} />Research paper collection</h2>
      <Card className="divide-y divide-line !p-0">{d.papers.map((p: any) => <div key={p.title} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4"><div><p className="font-medium text-ink">{p.title}</p><p className="text-xs text-muted">{p.authors} · {p.year}</p></div>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs">{p.topic}</span></div>)}</Card>
      <h2 className="mb-4 mt-10 flex items-center gap-2 text-xl font-semibold"><GraduationCap size={18} />Learning center</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{d.learning.map((l: any) => <Card key={l.title}><span className="text-xs font-medium text-success">{l.level}</span><h3 className="mt-1 font-semibold">{l.title}</h3><p className="mt-2 text-sm">{l.body}</p></Card>)}</div>
    </div>
  );
}
