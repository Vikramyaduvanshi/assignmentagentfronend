import { useState, useContext } from "react";
import "./Login.css";
import { Base } from "../api.js";
import { Authcontext } from "../authcontext/Authcontext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE ?? Base;
const LOGIN_URL = `${API_BASE}/auth8178/login`;

function readError(data, status) {
  if (status === 401) return "Email or password is wrong. Check both and try again.";
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return "Enter a valid email and password.";
  return "Could not sign in. Try again in a moment.";
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { fetchProfile } = useContext(Authcontext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        credentials: "include", // cookies set hone ke liye zaroori
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(readError(data, res.status));
        return;
      }

      // cookie set ho gayi, ab profile load karo.
      // profile milte hi PublicRoute apne aap "/" pe bhej dega
      const ok = await fetchProfile();

      if (!ok) setError("Signed in, but your profile could not be loaded. Try again.");
      window.location.assign("/"); 
    } catch {
      setError("Server is not reachable. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <aside className="login__aside">
        <div className="login__brand">Assignment Agents</div>

        <h1 className="login__headline">Every pending assignment, checked and marked.</h1>

        <div className="sheet" aria-hidden="true">
          <p className="sheet__title">Login system with blog project</p>
          <p className="sheet__meta">Total marks 10</p>

          <svg className="sheet__score" viewBox="0 0 96 96">
            <circle className="sheet__ring" cx="48" cy="48" r="42" pathLength="1" />
          </svg>
          <div className="sheet__marks">8/10</div>

          <ul className="sheet__remarks">
            <li>AI check: no AI traces found.</li>
            <li>Copy check: no match with others.</li>
            <li>Mistake: password is not hashed.</li>
            <li>Mistake: empty form is accepted.</li>
            <li>Fix: use bcrypt, validate inputs.</li>
          </ul>
        </div>
      </aside>

      <main className="login__main">
        <form className="login__form" onSubmit={handleSubmit} noValidate={false}>
          <h2 className="login__title">Sign in</h2>
          <p className="login__sub">Use your account email and password to continue.</p>

          <div className="login__field">
            <label className="login__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login__input"
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="login-password">
              Password
            </label>
            <div className="login__password">
              <input
                id="login-password"
                className="login__input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login__toggle"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button className="login__submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}