import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const post = (path: string, body: any) => api.post(path, body).then((r) => r.data);
export const get = (path: string) => api.get(path).then((r) => r.data);

export async function downloadReport(body: any) {
  const r = await api.post("/generate-report", body, { responseType: "blob" });
  const name = /filename="?([^";]+)"?/.exec(r.headers["content-disposition"] || "")?.[1] || `report.${body.format}`;
  const url = URL.createObjectURL(r.data);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
