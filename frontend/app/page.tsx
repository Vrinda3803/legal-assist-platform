"use client";

import Link from "next/link";
import { useState } from "react";
import { translations } from "../lib/translations";

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "hi" | "ml">("en");
  const t = translations[lang];

  return (
    <main className="premium-landing">
      <div className="premium-bg-glow" />

      <nav className="premium-nav">
        <div>
          <h1 className="premium-logo">Nyaya</h1>
          <p className="premium-logo-sub">{t.platformName}</p>
        </div>

        
      </nav>

      <section className="premium-hero-card">
        <div className="premium-badge">{t.badge}</div>

        <h2 className="premium-title">
          {t.title1}
          <br />
          <span>{t.title2}</span>
        </h2>

        <p className="premium-subtitle">{t.subtitle}</p>

        <div className="premium-actions">
         <Link href="/login" className="gold-btn">
  Get Started
</Link>

<Link href="/login" className="dark-outline-btn">
  Login
</Link>
        </div>

        <div className="premium-features">
          <div>
            <h3>{t.feature1Title}</h3>
            <p>{t.feature1Desc}</p>
          </div>

          <div>
            <h3>{t.feature2Title}</h3>
            <p>{t.feature2Desc}</p>
          </div>

          <div>
            <h3>{t.feature3Title}</h3>
            <p>{t.feature3Desc}</p>
          </div>
          
        </div>
      </section>
    </main>
  );
}