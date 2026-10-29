import csv, re
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from services import engine as E

REPORT_DIR = Path(__file__).resolve().parent.parent / "reports"

def content(rtype, m, b, device, method):
    """Returns dict(title, summary, metrics, header, rows, chart, recs)."""
    if rtype == "deployment":
        a = E.analyze(m, device); rec = E.recommend(m)
        return dict(title=f"Deployment Analysis Report: {m['name']}", summary=a["summary"] + " " + rec["headline"],
                    metrics=[("Parameters (M)", a["params_m"]), ("GFLOPs", a["gflops"]), ("Model size (MB)", a["size_mb"]),
                             ("Memory (MB)", a["mem_mb"]), (f"Latency on {device} (ms)", a["latency_ms"]),
                             ("Readiness", f"{a['readiness']}%"), ("Readiness after optimization", f"{a['readiness_optimized']}%")],
                    header=["Device", "Fits RAM", "Latency ms", "RAM %", "Power W", "Energy mJ"],
                    rows=[[d["device"], "Yes" if d["fits"] else "No", d["latency_ms"], min(d["ram_pct"], 100), d["power_w"], d["energy_mj"]] for d in a["devices"]],
                    chart=([d["device"] for d in a["devices"]], [d["power_w"] for d in a["devices"]], "Estimated power (W) by device"),
                    recs=rec["reasoning"] if rec["feasible"] else [rec["headline"]])
    if rtype == "optimization":
        o = E.optimize(m, method, device)
        return dict(title=f"Optimization Report: {m['name']} on {device}",
                    summary=f"{o['label']} gives a score of {o['score']}/100: size -{o['gains']['size']}%, latency -{o['gains']['latency']}%, power -{o['gains']['power']}% with an accuracy drop of {o['gains']['accuracy_drop']} points.",
                    metrics=[("Method", o["label"]), ("Optimization score", o["score"]), ("Size gain %", o["gains"]["size"]),
                             ("Latency gain %", o["gains"]["latency"]), ("Power gain %", o["gains"]["power"]), ("Accuracy drop", o["gains"]["accuracy_drop"])],
                    header=["Method", "Size %", "Latency %", "Memory %", "Power %", "Acc drop", "Score"],
                    rows=[[x["method"], x["size"], x["latency"], x["memory"], x["power"], x["accuracy_drop"], x["score"]] for x in o["all_methods"]],
                    chart=([x["method"] for x in o["all_methods"]], [x["score"] for x in o["all_methods"]], "Optimization score by method"),
                    recs=[f"Best method by score: {max(o['all_methods'], key=lambda x: x['score'])['method']}.", "Re-validate accuracy on a held-out set after optimizing."])
    bm = E.benchmark(m, b, device)
    return dict(title=f"Benchmark Report: {m['name']} vs {b['name']}",
                summary=f"On {device}, {bm['winner']} ranks first with an overall score of {bm['ranking'][0]['score']}.",
                metrics=[("Winner", bm["winner"]), ("Device", device), (f"{m['name']} score", bm["scores"]["a"]), (f"{b['name']} score", bm["scores"]["b"])],
                header=["Metric", m["name"], b["name"], "Winner"],
                rows=[[t["metric"], f"{t['a']} {t['unit']}", f"{t['b']} {t['unit']}", t["winner"]] for t in bm["table"]],
                chart=([m["name"], b["name"]], [bm["scores"]["a"], bm["scores"]["b"]], "Overall benchmark score"),
                recs=[bm["note"]])

def write_csv(c, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f); w.writerow([c["title"]]); w.writerow([c["summary"]]); w.writerow([])
        for k, v in c["metrics"]: w.writerow([k, v])
        w.writerow([]); w.writerow(c["header"]); w.writerows(c["rows"])

def write_pdf(c, path):
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Title"], textColor=colors.HexColor("#0F172A"), fontSize=20, alignment=0)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], textColor=colors.HexColor("#2563EB"))
    body = ParagraphStyle("b", parent=ss["BodyText"], textColor=colors.HexColor("#475569"), leading=14)
    def table(data, widths=None):
        t = Table(data, colWidths=widths, repeatRows=1)
        t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                               ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                               ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
        return t
    labels, values, ctitle = c["chart"]
    d = Drawing(460, 190); ch = VerticalBarChart(); ch.x, ch.y, ch.width, ch.height = 35, 35, 410, 130
    ch.data = [values]; ch.categoryAxis.categoryNames = [l.replace("Raspberry", "RPi").replace("Smartphone", "Phone") for l in labels]
    ch.categoryAxis.labels.fontSize = 6.5; ch.valueAxis.valueMin = 0; ch.valueAxis.labels.fontSize = 7
    ch.bars[0].fillColor = colors.HexColor("#2563EB"); d.add(ch)
    story = [Paragraph("Edge AI Deployment Toolkit", ParagraphStyle("k", parent=body, textColor=colors.HexColor("#64748B"))), Paragraph(c["title"], h1),
             Paragraph("Executive Summary", h2), Paragraph(c["summary"], body), Spacer(1, 8),
             Paragraph("Key Metrics", h2), table([["Metric", "Value"]] + [[k, str(v)] for k, v in c["metrics"]], [90 * mm, 70 * mm]), Spacer(1, 10),
             Paragraph(ctitle, h2), d, Paragraph("Detailed Results", h2), table([c["header"]] + [[str(x) for x in row] for row in c["rows"]]), Spacer(1, 10),
             Paragraph("Recommendations", h2)] + [Paragraph("&bull; " + x, body) for x in c["recs"]] + [
             Spacer(1, 14), Paragraph("Estimates come from an analytical model and should be validated with on-device measurements.",
                                      ParagraphStyle("f", parent=body, fontSize=7.5, textColor=colors.HexColor("#64748B")))]
    SimpleDocTemplate(str(path), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=16 * mm,
                      title=c["title"], author="Edge AI Deployment Toolkit").build(story)

def generate(rtype, fmt, m, b, device, method):
    if rtype not in ("deployment", "optimization", "benchmark"): raise ValueError("report_type must be deployment, optimization or benchmark")
    if fmt not in ("pdf", "csv"): raise ValueError("format must be pdf or csv")
    c = content(rtype, m, b, device, method)
    REPORT_DIR.mkdir(exist_ok=True)
    name = re.sub(r"[^A-Za-z0-9]+", "_", f"{rtype}_{m['name']}_{device}") + f".{fmt}"
    path = REPORT_DIR / name
    (write_pdf if fmt == "pdf" else write_csv)(c, path)
    return path, name, c
