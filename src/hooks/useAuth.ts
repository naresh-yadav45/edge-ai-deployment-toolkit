import { useEffect, useState } from "react";
import { get } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const load = () => {
      if (!localStorage.getItem("token")) return setUser(null);
      get("/auth/me").then(setUser).catch(() => { localStorage.removeItem("token"); setUser(null); });
    };
    load();
    window.addEventListener("auth", load);
    return () => window.removeEventListener("auth", load);
  }, []);
  return user;
}
export function setSession(token: string) { localStorage.setItem("token", token); window.dispatchEvent(new Event("auth")); }
export function logout() { localStorage.removeItem("token"); window.dispatchEvent(new Event("auth")); }
