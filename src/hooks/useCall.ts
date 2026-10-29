import { useCallback, useState } from "react";

export function useCall<T = any>(fn: (...a: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = useCallback(async (...a: any[]) => {
    setLoading(true); setError("");
    try { const r = await fn(...a); setData(r); return r; }
    catch (e: any) {
      const d = e?.response?.data?.detail;
      setError(typeof d === "string" ? d : d ? "Please check the inputs and try again." : e.message || "Request failed");
    } finally { setLoading(false); }
  }, [fn]);
  return { data, loading, error, run };
}
