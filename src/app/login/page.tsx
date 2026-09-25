"use client";

import { useState } from "react";
import Link from "next/link";
import { loginDosen, loginMahasiswa } from "@/lib/actions/auth";

export default function LoginPage() {
  const [tab, setTab] = useState<"mahasiswa" | "dosen">("mahasiswa");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result =
        tab === "dosen"
          ? await loginDosen(formData)
          : await loginMahasiswa(formData);
      if (result?.error) setError(result.error);
    } catch {
      // redirect on success
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; background: #F9F8F5; }
        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: #F9F8F5;
        }
        @media (max-width: 859px) {
          .login-root { grid-template-columns: 1fr; }
          .hero-outer { min-height: auto !important; }
          .hero-card { min-height: 420px !important; }
          .form-col { align-items: flex-start !important; padding: 40px 32px 56px !important; }
          .hero-headline { font-size: 32px !important; }
          .hero-body { font-size: 16px !important; }
        }
        @media (max-width: 479px) {
          .hero-outer { padding: 10px !important; }
          .hero-card { min-height: 340px !important; border-radius: 18px !important; }
          .hero-inset { left: 20px !important; right: 20px !important; }
          .hero-brand { top: 20px !important; left: 20px !important; right: 20px !important; }
          .hero-headline { font-size: 28px !important; }
          .hero-body { font-size: 14px !important; }
          .form-col { padding: 28px 20px 48px !important; }
        }
        input:focus { outline: none; border-color: #185B37 !important; box-shadow: 0 0 0 3px rgba(24,91,55,0.15); }
        .btn-masuk:hover { background: #004824 !important; }
        .btn-masuk:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="login-root">
        {/* Hero kiri */}
        <div className="hero-outer" style={{ padding: 16, minHeight: "100vh" }}>
          <div className="hero-card" style={{
            position: "relative", height: "100%", minHeight: 560,
            borderRadius: 24, overflow: "hidden", background: "#002310"
          }}>
            {/* Foto */}
            <img
              src="/hero-student.webp"
              alt="Kampus"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
            {/* Overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(0,30,12,0.55) 0%, transparent 28%, transparent 45%, rgba(0,22,8,0.94) 100%)",
              pointerEvents: "none"
            }} />

            {/* Brand atas */}
            <div className="hero-brand" style={{
              position: "absolute", top: 40, left: 40, right: 40,
              display: "flex", alignItems: "center", gap: 14, pointerEvents: "none"
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 800, fontSize: 15,
                letterSpacing: "0.02em", color: "#fff"
              }}>KK</div>
              <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3, letterSpacing: "-0.01em", maxWidth: 260, color: "#fff" }}>
                Platform Perkuliahan Perbankan dan Keuangan Digital
              </div>
            </div>

            {/* Copy bawah */}
            <div className="hero-inset" style={{
              position: "absolute", left: 40, right: 40, bottom: 44, maxWidth: 480, pointerEvents: "none"
            }}>
              <div style={{
                display: "inline-flex", padding: "6px 12px", borderRadius: 999,
                background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)", fontSize: 12, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 18, color: "#fff"
              }}>Portal Akademik</div>
              <div className="hero-headline" style={{
                fontSize: 38, fontWeight: 800, lineHeight: 1.15,
                letterSpacing: "-0.02em", marginBottom: 14, color: "#fff"
              }}>Belajar tanpa batas,<br />di mana saja.</div>
              <div className="hero-body" style={{ fontSize: 16, lineHeight: 1.6, color: "#F4F2EA" }}>
                Akses materi kuliah, tugas, dan absensi dalam satu platform yang mudah digunakan.
              </div>
            </div>
          </div>
        </div>

        {/* Form kanan */}
        <div className="form-col" style={{
          display: "flex", alignItems: "center", justifyContent: "center", padding: 40
        }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#252117", letterSpacing: "-0.01em" }}>
                Selamat datang kembali
              </div>
              <div style={{ fontSize: 15, color: "#65635D", marginTop: 6 }}>
                Masuk untuk melanjutkan perkuliahan Anda
              </div>
            </div>

            {/* Tab toggle */}
            <div style={{
              display: "flex", background: "#F0EEEB", borderRadius: 12,
              padding: 4, marginBottom: 28
            }}>
              {(["mahasiswa", "dosen"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => { setTab(role); setError(""); }}
                  style={{
                    flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 9,
                    fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                    fontFamily: "inherit", transition: "all 0.15s",
                    background: tab === role ? "#fff" : "transparent",
                    color: tab === role ? "#185B37" : "#74716B",
                    boxShadow: tab === role ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  {role === "mahasiswa" ? "Mahasiswa" : "Dosen"}
                </button>
              ))}
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 8,
                background: "#FEF2F2", border: "1px solid #FECACA",
                color: "#B91C1C", fontSize: 14
              }}>{error}</div>
            )}

            <form action={handleSubmit}>
              {/* Field ID */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3E3A2F", marginBottom: 8 }}>
                  {tab === "mahasiswa" ? "NIM" : "Email"}
                </label>
                {tab === "mahasiswa" ? (
                  <input
                    name="nim"
                    type="text"
                    required
                    placeholder="Masukkan NIM"
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: 10,
                      border: "1.5px solid #DFDEDA", fontSize: 16,
                      fontFamily: "inherit", background: "#fff", display: "block"
                    }}
                  />
                ) : (
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="dosen@email.com"
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: 10,
                      border: "1.5px solid #DFDEDA", fontSize: 16,
                      fontFamily: "inherit", background: "#fff", display: "block"
                    }}
                  />
                )}
              </div>

              {/* Password (dosen only) */}
              {tab === "dosen" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#3E3A2F" }}>Password</label>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Masukkan password"
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: 10,
                      border: "1.5px solid #DFDEDA", fontSize: 16,
                      fontFamily: "inherit", background: "#fff", display: "block"
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-masuk"
                style={{
                  width: "100%", padding: 14, border: "none", borderRadius: 10,
                  background: "#185B37", color: "#fff", fontSize: 15, fontWeight: 700,
                  fontFamily: "inherit", cursor: "pointer",
                  boxShadow: "0 8px 20px -6px rgba(24,91,55,0.5)",
                  marginTop: tab === "mahasiswa" ? 24 : 0
                }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#65635D" }}>
              Belum terdaftar?{" "}
              <Link
                href={tab === "dosen" ? "/register?role=dosen" : "/register"}
                style={{ color: "#185B37", fontWeight: 600, textDecoration: "none" }}
              >
                Daftar di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
