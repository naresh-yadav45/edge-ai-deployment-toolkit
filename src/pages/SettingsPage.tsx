import { Link } from "react-router-dom";
import { Card, PageHeader } from "../components/ui";
import { logout, useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export default function SettingsPage() {
  const user = useAuth();
  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" sub="Your profile and connection details." />
      <Card className="space-y-4">
        {user ? <>
          <div><p className="text-xs text-muted">Name</p><p className="font-medium text-ink">{user.name}</p></div>
          <div><p className="text-xs text-muted">Email</p><p className="font-medium text-ink">{user.email}</p></div>
          <div><p className="text-xs text-muted">Member since</p><p className="font-medium text-ink">{user.created_at}</p></div>
          <button className="btn-ghost" onClick={logout}>Sign out</button></>
          : <p className="text-sm">You are not signed in. <Link to="/auth" className="font-medium text-primary">Sign in</Link> to save analyses and reports.</p>}
        <div className="border-t border-line pt-4"><p className="text-xs text-muted">API endpoint</p><p className="font-mono text-sm text-ink">{api.defaults.baseURL}</p></div>
      </Card>
    </div>
  );
}
