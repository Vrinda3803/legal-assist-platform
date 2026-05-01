"use client";

import { registerUser } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await registerUser({
        username: name.trim().toLowerCase(),
        password,
      });

      alert("Registration successful. Please login.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Username may already exist.");
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="landing-badge">Nyaya</div>

        <h1 className="auth-title">Register</h1>

        <p className="auth-subtitle">
          Create an account to securely access document analysis, saved responses,
          and personalized history.
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <label className="auth-label">Full Name</label>
          <input
            className="auth-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />

          <label className="auth-label">Confirm Password</label>
          <input
            className="auth-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />

          <button type="submit" className="primary-btn auth-submit">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}