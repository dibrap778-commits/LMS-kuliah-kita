"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerMahasiswa, registerDosen } from "@/lib/actions/auth";
import Spinner from "@/components/Spinner";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [isDosen, setIsDosen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("role") === "dosen") setIsDosen(true);
  }, [searchParams]);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = isDosen
        ? await registerDosen(formData)
        : await registerMahasiswa(formData);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #ffffff; color: #334155; }

        .lp-page { min-height: 100svh; background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%); display: flex; flex-direction: column; }
        .lp-shell { max-width: 1440px; margin: 0 auto; padding: 0 56px; width: 100%; }

        .lp-header { border-bottom: 1px solid #dbeafe; }
        .lp-header-inner { display: flex; align-items: center; padding: 24px 0; }
        .lp-brand { display: flex; align-items: center; gap: 14px; }
        .lp-brand-mark { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; background: #fff; border: 1px solid #c7ddfb; display: flex; align-items: center; justify-content: center; padding: 4px; }
        .lp-brand-mark img { width: 100%; height: 100%; object-fit: contain; }
        .lp-brand-name { font-weight: 800; font-size: 15.5px; color: #0b1748; letter-spacing: 0.01em; line-height: 1.25; max-width: 320px; }
        .lp-brand-sub { font-size: 13px; color: #586b88; margin-top: 1px; }

        .lp-main { flex: 1; display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: start; padding: 64px 0 56px; }
        .lp-main > * { min-width: 0; }

        .lp-badge { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; color: #2563eb; border: 1px solid #c7ddfb; border-radius: 999px; padding: 7px 16px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 20px; }
        .lp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #2563eb; }

        .lp-hero-lead { font-size: 18px; line-height: 1.55; color: #586b88; max-width: 560px; margin: 24px 0 28px; }

        .lp-hero-photo { position: relative; border-radius: 24px; overflow: hidden; aspect-ratio: 4/3; border: 1px solid #c7ddfb; }
        .lp-hero-photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block; }
        .lp-hero-photo::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(0deg, rgba(255,255,255,0) 88%, rgba(255,255,255,.35) 100%); }

        .lp-features { display: flex; gap: 28px; flex-wrap: wrap; }
        .lp-feature { display: flex; align-items: center; gap: 10px; }
        .lp-feature-icon { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; background: #eff6ff; border: 1px solid #c7ddfb; display: flex; align-items: center; justify-content: center; color: #2563eb; }
        .lp-feature span { font-size: 14.5px; font-weight: 500; color: #0b1748; }

        .lp-card { background: #fff; border: 1px solid #c7ddfb; border-radius: 28px; box-shadow: 0 12px 40px rgb(37 99 235 / 8%); padding: 44px; max-width: 600px; }
        .lp-card h2 { font-size: 30px; font-weight: 750; color: #0b1748; margin: 0 0 6px; }
        .lp-card-lead { font-size: 15px; color: #586b88; margin: 0 0 28px; }

        .lp-roleswitch { display: flex; background: #eff6ff; border: 1px solid #c7ddfb; border-radius: 14px; padding: 4px; margin-bottom: 24px; gap: 4px; }
        .lp-roleswitch button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; background: transparent; cursor: pointer; padding: 12px 0; border-radius: 10px; font-size: 14.5px; font-weight: 600; color: #0b1748; font-family: inherit; transition: background .18s, color .18s; }
        .lp-roleswitch button[aria-pressed="true"] { background: #2563eb; color: #fff; }

        .lp-field { margin-bottom: 20px; }
        .lp-field label { display: block; font-size: 13.5px; font-weight: 600; color: #0b1748; margin-bottom: 8px; }
        .lp-field .control { position: relative; }
        .lp-field .control svg.leading { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #586b88; pointer-events: none; }
        .lp-field input { width: 100%; min-height: 56px; border-radius: 14px; border: 1.5px solid #c7ddfb; background: #f5f9ff; padding: 0 16px 0 46px; font-size: 16px; font-family: inherit; color: #0b1748; }
        .lp-field input::placeholder { color: #586b88; opacity: .85; }
        .lp-field input:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; border-color: #2563eb; }
        .lp-field.password input { padding-right: 48px; }
        .lp-eye-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: #586b88; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        .lp-eye-toggle:hover { background: #eff6ff; color: #2563eb; }

        .lp-submit { width: 100%; min-height: 56px; border: none; border-radius: 14px; background: #2563eb; color: #fff; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background .15s; margin-top: 4px; }
        .lp-submit:hover { background: #1d4ed8; }
        .lp-submit:active { background: #1e40af; }
        .lp-submit:disabled { opacity: .7; cursor: default; }

        .lp-divider-row { border-top: 1px solid #dbeafe; margin-top: 28px; padding-top: 20px; text-align: center; font-size: 13.5px; color: #586b88; }
        .lp-divider-row a { color: #2563eb; text-decoration: none; font-weight: 600; }
        .lp-divider-row a:hover { color: #1d4ed8; text-decoration: underline; }

        .lp-footer { border-top: 1px solid #dbeafe; padding: 22px 0 32px; display: flex; align-items: center; justify-content: space-between; font-size: 13.5px; color: #586b88; flex-wrap: wrap; gap: 10px; }

        @media (max-width: 1023px) {
          .lp-shell { padding: 0 28px; }
          .lp-main { grid-template-columns: 1fr; padding-top: 40px; }
          .lp-card { max-width: 560px; margin: 0 auto; }
          .lp-hero { max-width: 640px; margin: 0 auto; }
        }
        @media (max-width: 767px) {
          .lp-shell { padding: 0 18px; }
          .lp-header-inner { padding: 18px 0; }
          .lp-brand-name { font-size: 13px; max-width: 200px; }
          .lp-badge { display: none; }
          .lp-main { padding-top: 28px; gap: 32px; }
          .lp-card { padding: 24px; border-radius: 20px; }
          .lp-roleswitch button { padding: 11px 0; font-size: 13.5px; }
          .lp-field input { min-height: 52px; font-size: 16px; }
          .lp-submit { min-height: 52px; }
          .lp-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div className="lp-page">
        <div className="lp-shell">
          <header className="lp-header">
            <div className="lp-header-inner">
              <div className="lp-brand">
                <div className="lp-brand-mark">
                  <img src="/logo-primaniyarta.png" alt="Logo Akademi Bisnis dan Keuangan Primaniyarta" />
                </div>
                <div>
                  <div className="lp-brand-name">AKADEMI BISNIS DAN KEUANGAN PRIMANIYARTA</div>
                  <div className="lp-brand-sub">Portal Akademik</div>
                </div>
              </div>
            </div>
          </header>

          <main className="lp-main">
            <section className="lp-hero">
              <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                Langkah besar dimulai dari sini.
              </h1>

              <div className="lp-hero-photo">
                <img
                  src="/hero-mahasiswa-headline.jpg"
                  alt="Langkah besar dimulai dari sini. Mahasiswa menggunakan VR dan mahasiswi berhijab belajar teknologi di laboratorium komputer."
                />
              </div>

              <div className="lp-badge" style={{ marginTop: 24 }}><span className="lp-badge-dot" />SATU PORTAL, SEMUA AKTIVITAS AKADEMIK</div>
              <p className="lp-hero-lead" style={{ marginTop: 14 }}>Terhubung dengan pembelajaran dan layanan akademik dalam satu tempat.</p>

              <div className="lp-features">
                <div className="lp-feature">
                  <span className="lp-feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></svg>
                  </span>
                  <span>Pembelajaran</span>
                </div>
                <div className="lp-feature">
                  <span className="lp-feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
                  </span>
                  <span>Layanan Akademik</span>
                </div>
                <div className="lp-feature">
                  <span className="lp-feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" /></svg>
                  </span>
                  <span>Informasi Kampus</span>
                </div>
              </div>
            </section>

            <section className="lp-card" aria-labelledby="rg-h2">
              <h2 id="rg-h2">Buat akun baru</h2>
              <p className="lp-card-lead">
                {isDosen ? "Registrasi akun dosen." : "Registrasi akun mahasiswa."}
              </p>

              <div className="lp-roleswitch" role="radiogroup" aria-label="Daftar sebagai">
                {([false, true] as const).map((dosen) => (
                  <button
                    key={String(dosen)}
                    type="button"
                    role="radio"
                    aria-pressed={isDosen === dosen}
                    aria-checked={isDosen === dosen}
                    onClick={() => { setIsDosen(dosen); setError(""); }}
                  >
                    {dosen ? "Dosen" : "Mahasiswa"}
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
                {isDosen ? (
                  <>
                    <div className="lp-field">
                      <label htmlFor="rg-nama">Nama Lengkap</label>
                      <div className="control">
                        <svg className="leading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></svg>
                        <input id="rg-nama" name="nama" type="text" required autoComplete="name" placeholder="Nama sesuai identitas" />
                      </div>
                    </div>
                    <div className="lp-field">
                      <label htmlFor="rg-email">Email</label>
                      <div className="control">
                        <svg className="leading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
                        <input id="rg-email" name="email" type="email" required autoComplete="username" placeholder="dosen@email.com" />
                      </div>
                    </div>
                    <div className="lp-field password">
                      <label htmlFor="rg-password">Password</label>
                      <div className="control">
                        <svg className="leading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                        <input
                          id="rg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          placeholder="Minimal 6 karakter"
                        />
                        <button
                          type="button"
                          className="lp-eye-toggle"
                          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.88 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.2 13.2 0 0 1-3.17 4.1M6.6 6.6C3.9 8.3 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.33-.9" /></svg>
                          ) : (
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lp-field">
                      <label htmlFor="rg-nim">NIM</label>
                      <div className="control">
                        <svg className="leading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" /></svg>
                        <input id="rg-nim" name="nim" type="text" required placeholder="Nomor Induk Mahasiswa" />
                      </div>
                    </div>
                    <div className="lp-field">
                      <label htmlFor="rg-nama-mhs">Nama Lengkap</label>
                      <div className="control">
                        <svg className="leading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></svg>
                        <input id="rg-nama-mhs" name="nama" type="text" required autoComplete="name" placeholder="Nama sesuai identitas" />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="lp-submit">
                  {loading && <Spinner light />}
                  {loading ? "Memproses..." : "Daftar"}
                  {!loading && (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  )}
                </button>
              </form>

              <div className="lp-divider-row">
                Sudah punya akun? <Link href="/login">Masuk di sini</Link>
              </div>
            </section>
          </main>

          <footer className="lp-footer">
            <span>&copy; {new Date().getFullYear()} Akademi Bisnis dan Keuangan Primaniyarta</span>
          </footer>
        </div>
      </div>
    </>
  );
}
