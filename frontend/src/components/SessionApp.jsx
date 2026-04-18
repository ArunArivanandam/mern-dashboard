import { useState, useEffect, createContext, useContext } from "react";

// ─── API ───────────────────────────────────────────────────────────────────
const API = "http://localhost:3000/session";

const api = {
  register: (data) =>
    fetch(`${API}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data) =>
    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  logout: () =>
    fetch(`${API}/logout`, {
      method: "POST",
      credentials: "include",
    }).then((r) => r.json()),

  getProfile: () =>
    fetch(`${API}/profile`, { credentials: "include" }).then((r) => r.json()),

  getAllUsers: () =>
    fetch(`${API}/`, { credentials: "include" }).then((r) => r.json()),

  getUser: (id) =>
    fetch(`${API}/${id}`, { credentials: "include" }).then((r) => r.json()),

  updateUser: (id, data) =>
    fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteUser: (id) =>
    fetch(`${API}/${id}`, {
      method: "DELETE",
      credentials: "include",
    }),
};

// ─── Auth Context ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds) => {
    const data = await api.login(creds);
    if (data.error) throw new Error(data.error);
    const profile = await api.getProfile();
    setUser(profile);
    return profile;
  };

  const register = async (creds) => {
    const data = await api.register(creds);
    if (data.error) throw new Error(data.error);
    const profile = await api.getProfile();
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0d0d;
    --surface: #161616;
    --surface2: #1e1e1e;
    --border: #2a2a2a;
    --border-lit: #3d3d3d;
    --accent: #c8f135;
    --accent-dim: rgba(200, 241, 53, 0.12);
    --accent-glow: rgba(200, 241, 53, 0.25);
    --text: #f0f0f0;
    --text-muted: #6b6b6b;
    --text-mid: #9a9a9a;
    --red: #ff4d6d;
    --red-dim: rgba(255, 77, 109, 0.12);
    --font-serif: 'Instrument Serif', Georgia, serif;
    --font-mono: 'DM Mono', 'Fira Code', monospace;
    --radius: 6px;
    --transition: 160ms cubic-bezier(.4,0,.2,1);
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .app { display: flex; height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
  }

  .sidebar-brand {
    padding: 0 20px 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .brand-title {
    font-family: var(--font-serif);
    font-size: 20px;
    font-style: italic;
    color: var(--accent);
    line-height: 1.1;
  }

  .brand-sub {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .nav { flex: 1; }

  .nav-section {
    padding: 6px 20px 4px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px;
    cursor: pointer;
    color: var(--text-mid);
    font-size: 12.5px;
    transition: background var(--transition), color var(--transition);
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    position: relative;
  }

  .nav-item:hover { background: var(--surface2); color: var(--text); }

  .nav-item.active {
    color: var(--accent);
    background: var(--accent-dim);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--accent);
    border-radius: 0 2px 2px 0;
  }

  .nav-icon { font-size: 14px; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 20px 0;
    border-top: 1px solid var(--border);
  }

  .session-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 10px;
  }

  .session-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  .session-dot.active { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
  .session-dot.inactive { background: var(--text-muted); animation: none; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .session-label { font-size: 11px; color: var(--text-muted); }
  .session-email { font-size: 11px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 130px; }

  /* ── Main ── */
  .main {
    flex: 1;
    overflow-y: auto;
    background: var(--bg);
  }

  .page-header {
    padding: 28px 36px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .page-title {
    font-family: var(--font-serif);
    font-size: 28px;
    font-style: italic;
    color: var(--text);
    line-height: 1;
  }

  .page-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.05em; }

  .page-body { padding: 32px 36px; }

  /* ── Cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .card-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .card-title { font-size: 12px; color: var(--text-mid); letter-spacing: 0.04em; text-transform: uppercase; }

  .card-body { padding: 24px 20px; }

  /* ── Forms ── */
  .form-grid { display: grid; gap: 16px; }

  .field { display: flex; flex-direction: column; gap: 6px; }

  .field-label { font-size: 11px; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; }

  .field-input {
    padding: 10px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .field-input::placeholder { color: var(--text-muted); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: var(--radius);
    font-family: var(--font-mono);
    font-size: 12.5px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--transition);
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--accent);
    color: #0d0d0d;
    font-weight: 500;
    border-color: var(--accent);
  }

  .btn-primary:hover { filter: brightness(1.08); box-shadow: 0 0 14px var(--accent-glow); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; filter: none; box-shadow: none; }

  .btn-ghost {
    background: none;
    color: var(--text-mid);
    border-color: var(--border);
  }

  .btn-ghost:hover { background: var(--surface2); color: var(--text); border-color: var(--border-lit); }

  .btn-danger {
    background: var(--red-dim);
    color: var(--red);
    border-color: rgba(255,77,109,0.2);
  }

  .btn-danger:hover { background: rgba(255,77,109,0.2); }

  .btn-sm { padding: 6px 12px; font-size: 11.5px; }

  /* ── Alerts ── */
  .alert {
    padding: 10px 14px;
    border-radius: var(--radius);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alert-error { background: var(--red-dim); border: 1px solid rgba(255,77,109,0.25); color: var(--red); }
  .alert-success { background: var(--accent-dim); border: 1px solid rgba(200,241,53,0.25); color: var(--accent); }

  /* ── Two column auth layout ── */
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    background: var(--bg);
  }

  .auth-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
    top: -100px; left: -100px;
    pointer-events: none;
  }

  .auth-left::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 70%);
    bottom: -60px; right: -60px;
    pointer-events: none;
  }

  .auth-hero-title {
    font-family: var(--font-serif);
    font-size: clamp(36px, 5vw, 58px);
    font-style: italic;
    line-height: 1.05;
    color: var(--text);
    position: relative;
    z-index: 1;
  }

  .auth-hero-title span { color: var(--accent); }

  .auth-hero-sub {
    margin-top: 16px;
    font-size: 13px;
    color: var(--text-muted);
    max-width: 360px;
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }

  .auth-features {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .auth-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--text-mid);
  }

  .auth-feature-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }

  .auth-right {
    width: 460px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 50px;
  }

  .auth-tabs {
    display: flex;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 28px;
  }

  .auth-tab {
    flex: 1;
    padding: 9px;
    text-align: center;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
    background: none;
    border: none;
    transition: all var(--transition);
    letter-spacing: 0.04em;
  }

  .auth-tab.active {
    background: var(--accent);
    color: #0d0d0d;
    font-weight: 500;
  }

  /* ── Profile card ── */
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .profile-avatar {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: var(--accent-dim);
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-serif);
    font-size: 22px;
    font-style: italic;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .profile-name {
    font-family: var(--font-serif);
    font-size: 22px;
    font-style: italic;
    color: var(--text);
  }

  .profile-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
  }

  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .info-val { font-size: 12.5px; color: var(--text); }

  .badge {
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 10.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .badge-user { background: rgba(100,149,255,0.12); color: #6495ff; border: 1px solid rgba(100,149,255,0.25); }
  .badge-admin { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(200,241,53,0.25); }
  .badge-active { background: rgba(80,230,140,0.12); color: #50e68c; border: 1px solid rgba(80,230,140,0.25); }
  .badge-inactive { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,77,109,0.2); }

  /* ── Users table ── */
  .table { width: 100%; border-collapse: collapse; }
  .table th {
    text-align: left;
    padding: 10px 14px;
    font-size: 10.5px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-bottom: 1px solid var(--border);
    font-weight: 400;
  }
  .table td {
    padding: 12px 14px;
    font-size: 12.5px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: rgba(255,255,255,0.015); }

  /* ── Modal overlay ── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(3px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 150ms ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface);
    border: 1px solid var(--border-lit);
    border-radius: 10px;
    overflow: hidden;
    animation: slideUp 180ms ease;
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title { font-size: 13px; color: var(--text); }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background var(--transition), color var(--transition);
  }

  .close-btn:hover { background: var(--surface2); color: var(--text); }

  /* ── Misc ── */
  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(200,241,53,0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: var(--bg);
  }

  .loading-title { font-family: var(--font-serif); font-style: italic; font-size: 18px; color: var(--text-muted); }

  .empty-state {
    padding: 48px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
  }

  .empty-state-icon { font-size: 28px; margin-bottom: 10px; opacity: 0.4; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; padding: 40px 28px; }
    .sidebar { width: 180px; }
    .page-body { padding: 24px 20px; }
    .page-header { padding: 20px; }
    .profile-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Shared Components ─────────────────────────────────────────────────────
function Spinner() {
  return <span className="spinner" />;
}

function Alert({ type = "error", children }) {
  return (
    <div className={`alert alert-${type}`}>
      <span>{type === "error" ? "⚠" : "✓"}</span>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}

// ─── Auth Page ─────────────────────────────────────────────────────────────
function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          userName: form.userName,
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-hero-title">
          Secure
          <br />
          session
          <br />
          <span>auth.</span>
        </div>
        <p className="auth-hero-sub">
          Server-side sessions stored in MongoDB. Every request is verified
          against an active session token.
        </p>
        <div className="auth-features">
          {[
            "HttpOnly cookies — XSS resistant",
            "Session fixation prevention on login",
            "SameSite strict CSRF mitigation",
            "MongoDB-backed persistent sessions",
            "7-day TTL with native auto-removal",
          ].map((f) => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <div className="form-grid">
          {tab === "register" && (
            <div className="field">
              <label className="field-label">Username</label>
              <input
                className="field-input"
                placeholder="johndoe"
                value={form.userName}
                onChange={set("userName")}
                onKeyDown={handleKey}
              />
            </div>
          )}
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              onKeyDown={handleKey}
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              onKeyDown={handleKey}
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            {tab === "login" ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ──────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const updated = await api.updateUser(user._id, form);
      setUser(updated);
      setMsg({ type: "success", text: "Profile updated." });
      setEditing(false);
    } catch {
      setMsg({ type: "error", text: "Update failed." });
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.userName?.[0]?.toUpperCase() || "U";
  const created = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Authenticated via server session</div>
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          ⎋ Sign out
        </button>
      </div>
      <div className="page-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "20px",
          }}
        >
          {/* Identity card */}
          <div className="card">
            <div className="card-body">
              <div className="profile-avatar">{initial}</div>
              <div className="profile-name">{user?.userName}</div>
              <div className="profile-email">{user?.email}</div>
              <div style={{ marginTop: "20px" }}>
                <div className="info-row">
                  <span className="info-key">Role</span>
                  <span className={`badge badge-${user?.role}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-key">Status</span>
                  <span
                    className={`badge badge-${user?.isActive ? "active" : "inactive"}`}
                  >
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-key">Joined</span>
                  <span className="info-val" style={{ fontSize: "11px" }}>
                    {created}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-key">ID</span>
                  <span
                    className="info-val"
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    {user?._id?.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Account Details</span>
              {!editing && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(true)}
                >
                  ✎ Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {msg && <Alert type={msg.type}>{msg.text}</Alert>}
              <div
                className="form-grid"
                style={{ marginTop: msg ? "16px" : 0 }}
              >
                <div className="field">
                  <label className="field-label">Username</label>
                  {editing ? (
                    <input
                      className="field-input"
                      value={form.userName}
                      onChange={set("userName")}
                    />
                  ) : (
                    <div
                      className="info-val"
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      {user?.userName}
                    </div>
                  )}
                </div>
                <div className="field">
                  <label className="field-label">Email</label>
                  {editing ? (
                    <input
                      className="field-input"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                    />
                  ) : (
                    <div
                      className="info-val"
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      {user?.email}
                    </div>
                  )}
                </div>
                {editing && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn btn-primary"
                      onClick={saveProfile}
                      disabled={loading}
                    >
                      {loading ? <Spinner /> : null} Save changes
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditing(false);
                        setMsg(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Users Page ────────────────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (u) => {
    setEditModal(u);
    setEditForm({ userName: u.userName, email: u.email });
  };

  const saveEdit = async () => {
    setSaveLoading(true);
    try {
      await api.updateUser(editModal._id, editForm);
      setMsg({ type: "success", text: "User updated." });
      setEditModal(null);
      load();
    } catch {
      setMsg({ type: "error", text: "Update failed." });
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setDeleting(id);
    try {
      await api.deleteUser(id);
      setUsers((u) => u.filter((x) => x._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">All Users</div>
          <div className="page-sub">GET /session — admin overview</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          ↺ Refresh
        </button>
      </div>

      <div className="page-body">
        {msg && (
          <div style={{ marginBottom: "16px" }}>
            <Alert type={msg.type}>{msg.text}</Alert>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="empty-state">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              No users found
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--accent-dim)",
                            border: "1px solid rgba(200,241,53,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "var(--accent)",
                            fontFamily: "var(--font-serif)",
                            fontStyle: "italic",
                            flexShrink: 0,
                          }}
                        >
                          {u.userName?.[0]?.toUpperCase()}
                        </div>
                        {u.userName}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${u.isActive ? "active" : "inactive"}`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      style={{ color: "var(--text-muted)", fontSize: "11px" }}
                    >
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelected(u)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(u._id)}
                          disabled={deleting === u._id}
                        >
                          {deleting === u._id ? <Spinner /> : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View modal */}
      {selected && (
        <Modal
          title={`User — ${selected.userName}`}
          onClose={() => setSelected(null)}
        >
          <div className="info-row">
            <span className="info-key">ID</span>
            <span className="info-val" style={{ fontSize: "11px" }}>
              {selected._id}
            </span>
          </div>
          <div className="info-row">
            <span className="info-key">Username</span>
            <span className="info-val">{selected.userName}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Email</span>
            <span className="info-val">{selected.email}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Role</span>
            <span className={`badge badge-${selected.role}`}>
              {selected.role}
            </span>
          </div>
          <div className="info-row">
            <span className="info-key">Active</span>
            <span
              className={`badge badge-${selected.isActive ? "active" : "inactive"}`}
            >
              {String(selected.isActive)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-key">Created</span>
            <span className="info-val">
              {new Date(selected.createdAt).toLocaleString()}
            </span>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editModal && (
        <Modal
          title={`Edit — ${editModal.userName}`}
          onClose={() => setEditModal(null)}
        >
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Username</label>
              <input
                className="field-input"
                value={editForm.userName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, userName: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-primary"
                onClick={saveEdit}
                disabled={saveLoading}
              >
                {saveLoading ? <Spinner /> : null} Save
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setEditModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Shell / Layout ────────────────────────────────────────────────────────
const NAV = [
  { id: "profile", label: "Profile", icon: "◉" },
  { id: "users", label: "All Users", icon: "⊞" },
];

function Shell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("profile");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-title">
            Session
            <br />
            Auth
          </div>
          <div className="brand-sub">MERN · Express-session</div>
        </div>
        <nav className="nav">
          <div className="nav-section">Navigation</div>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="session-chip">
            <div className="session-dot active" />
            <div style={{ overflow: "hidden" }}>
              <div className="session-email">{user?.email}</div>
              <div className="session-label">session active</div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "11.5px" }}
            onClick={logout}
          >
            ⎋ Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        {page === "profile" && <ProfilePage />}
        {page === "users" && <UsersPage />}
      </main>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <style>{styles}</style>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <Spinner />
          <div className="loading-title">Checking session…</div>
        </div>
      </>
    );
  }

  return user ? <Shell /> : <AuthPage />;
}
