import { useCallback, useEffect, useState } from "react";
import { BarChart3, BriefcaseBusiness, FolderKanban, LogOut, Settings, ShieldAlert, Users } from "lucide-react";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
type Section = "dashboard" | "users" | "jobs" | "categories" | "reports" | "settings";
type Dashboard = { users: number; jobs: number; pendingModeration: number; publishedJobs: number; openReports: number };

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API}/api${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status})`);
  return body as T;
}

export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      if (section === "dashboard") setDashboard(await request<Dashboard>("/admin/dashboard"));
      else if (section === "users") setData((await request<{ data: any[] }>("/admin/users")).data);
      else if (section === "jobs") setData((await request<{ data: any[] }>("/admin/jobs")).data);
      else if (section === "categories") setData((await request<{ data: any[] }>("/admin/categories")).data);
      else if (section === "reports") setData((await request<{ data: any[] }>("/admin/reports")).data);
    } catch (cause) {
      setAuthenticated(false);
      setError(cause instanceof Error ? cause.message : "Unable to load admin data.");
    }
  }, [section]);

  useEffect(() => { if (authenticated) void load(); }, [authenticated, load]);

  if (!authenticated) {
    return <main className="login"><div className="login-card"><div className="brand-mark">LJ</div><p className="eyebrow">LANKAJOBS OPERATIONS</p><h1>Admin access</h1><p className="muted">Sign in with a phone account that has an ADMIN or SUPER_ADMIN role. Access is enforced by the API.</p><label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+94771234567" /></label>{codeSent && <label>Verification code<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Six digits" /></label>}<button onClick={async () => { try { if (!codeSent) { await request("/auth/phone/request", { method: "POST", body: JSON.stringify({ phone }) }); setCodeSent(true); } else { await request("/auth/phone/verify", { method: "POST", body: JSON.stringify({ phone, code }) }); setAuthenticated(true); } } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); } }}>{codeSent ? "Verify and continue" : "Send verification code"}</button>{error && <p className="error">{error}</p>}</div></main>;
  }

  const nav: [Section, string, typeof BarChart3][] = [["dashboard", "Overview", BarChart3], ["users", "Users", Users], ["jobs", "Jobs", BriefcaseBusiness], ["categories", "Categories", FolderKanban], ["reports", "Reports", ShieldAlert], ["settings", "Settings", Settings]];
  return <div className="shell"><aside><div className="brand"><span className="brand-mark">LJ</span><span>LankaJobs<br /><small>Admin</small></span></div><nav>{nav.map(([key, label, Icon]) => <button className={section === key ? "active" : ""} onClick={() => setSection(key)} key={key}><Icon size={17} />{label}</button>)}</nav><button className="logout" onClick={() => { void request("/auth/logout", { method: "POST" }); setAuthenticated(false); }}><LogOut size={17} />Sign out</button></aside><main className="content"><header><div><p className="eyebrow">PLATFORM CONTROL</p><h1>{nav.find(([key]) => key === section)?.[1]}</h1></div><button className="secondary" onClick={() => void load()}>Refresh</button></header>{error && <div className="error-banner">{error}</div>}{section === "dashboard" && dashboard && <DashboardView value={dashboard} />}{section !== "dashboard" && section !== "settings" && <TableView section={section} data={data} reload={load} />}{section === "settings" && <SettingsView reload={load} />}</main></div>;
}

function DashboardView({ value }: { value: Dashboard }) {
  const cards = [["Users", value.users, "Total registered accounts"], ["Jobs", value.jobs, "All statuses"], ["Pending review", value.pendingModeration, "Needs moderation"], ["Published", value.publishedJobs, "Visible to seekers"], ["Open reports", value.openReports, "Needs attention"]];
  return <div className="cards">{cards.map(([label, number, note]) => <article className="stat" key={label as string}><span>{label}</span><strong>{number}</strong><small>{note}</small></article>)}</div>;
}

function TableView({ section, data, reload }: { section: Section; data: any[]; reload: () => Promise<void> }) {
  return <section className="panel"><div className="panel-head"><div><h2>{section[0].toUpperCase() + section.slice(1)}</h2><p className="muted">Live records from the LankaJobs database.</p></div><span className="count">{data.length}</span></div><div className="table-wrap"><table><thead><tr><th>Record</th><th>Status</th><th>Details</th><th>Action</th></tr></thead><tbody>{data.map((row) => <tr key={row.id}><td><strong>{row.name ?? row.title ?? row.reason ?? row.slug ?? row.id}</strong><small>{row.email ?? row.company ?? row.location ?? row.createdAt ?? ""}</small></td><td><span className={`status ${String(row.status ?? "ACTIVE").toLowerCase()}`}>{row.status ?? "ACTIVE"}</span></td><td>{row.role ?? row.categoryId ?? row.resolution ?? row.description?.slice(0, 90) ?? "—"}</td><td>{section === "jobs" && row.status === "PENDING_REVIEW" ? <button className="tiny" onClick={async () => { await request(`/admin/jobs/${row.id}/moderate`, { method: "POST", body: JSON.stringify({ status: "PUBLISHED" }) }); await reload(); }}>Approve</button> : "—"}</td></tr>)}</tbody></table>{!data.length && <div className="empty">No records found.</div>}</div></section>;
}

function SettingsView({ reload }: { reload: () => Promise<void> }) {
  const [settings, setSettings] = useState({ postingPrice: "0", featuredPrice: "0", sponsoredPrice: "0", paymentsEnabled: false, moderationEnabled: true });
  useEffect(() => { void request<typeof settings>("/admin/settings").then(setSettings).catch(() => undefined); }, []);
  return <section className="panel settings"><div className="panel-head"><div><h2>Platform settings</h2><p className="muted">Payments remain disabled until an administrator deliberately enables them.</p></div></div>{(["postingPrice", "featuredPrice", "sponsoredPrice"] as const).map((key) => <label key={key}>{key.replace("Price", " price")}<input value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} /></label>)}<label className="switch"><input type="checkbox" checked={settings.paymentsEnabled} onChange={(event) => setSettings({ ...settings, paymentsEnabled: event.target.checked })} /> Payments enabled</label><button onClick={async () => { await request("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }); await reload(); }}>Save settings</button></section>;
}