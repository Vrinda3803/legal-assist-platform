"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Documents", href: "/documents" },
    { label: "Query History", href: "/history" },
    { label: "Saved Responses", href: "/saved" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">Nyaya</div>
      <div className="brand-sub">AI Legal Assistance Platform</div>

      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active-link" : ""}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}