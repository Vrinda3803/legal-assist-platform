"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Navbar
          title="Settings"
          subtitle="Manage your account and platform preferences."
        />

        <div className="card">
          <h2 className="card-title">Account</h2>
          <p className="response-text">
            More settings and account controls can be added here.
          </p>
        </div>
      </main>
    </div>
  );
}