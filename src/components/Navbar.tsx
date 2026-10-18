"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({
  nama,
  role,
}: {
  nama: string;
  role: "dosen" | "mahasiswa";
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-divider)" }}>
      <div
        style={{
          maxWidth: 1160, margin: "0 auto", padding: "14px 32px",
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        }}
      >
        <Link
          href={role === "dosen" ? "/dosen" : "/mahasiswa"}
          style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto", textDecoration: "none" }}
        >
          <span style={{
            width: 40, height: 40, flexShrink: 0, border: "1px solid var(--color-divider)",
            borderRadius: 10, display: "grid", placeItems: "center", overflow: "hidden",
            background: "#fff", padding: 4,
          }}>
            <img src="/logo-primaniyarta.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </span>
          <span style={{
            font: "800 15.5px/1.25 var(--font-heading)", letterSpacing: ".01em",
            color: "var(--color-text)", maxWidth: 240,
          }}>
            AKADEMI BISNIS DAN KEUANGAN PRIMANIYARTA
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
          <span style={{ color: "var(--color-text)" }}>{nama}</span>
          <span className="tag tag-accent">{role}</span>
          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "var(--color-text)", background: "none", border: "none",
              cursor: "pointer", font: "inherit", fontSize: 14, padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}
