"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (loading) return;

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) {
    alert("Please enter username and password.");
    return;
  }

  try {
    setLoading(true);

    const data = await loginUser({
      username: cleanUsername,
      password: cleanPassword,
    });

    localStorage.clear();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("nyaya_user", data.username || cleanUsername);

    window.location.replace("/dashboard");
  } catch (error) {
    console.error(error);
    alert("Invalid username or password.");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="landing-badge">Nyaya</div>
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">
          Access your legal assistant dashboard, saved responses, and document tools.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="primary-btn auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}