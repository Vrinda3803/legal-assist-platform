"use client";

type NavbarProps = {
  title: string;
  subtitle: string;
};

export default function Navbar({ title, subtitle }: NavbarProps) {
  return (
    <section className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </section>
  );
}