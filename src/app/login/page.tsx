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
      // redirect throws, so this is expected on success
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-emerald-700">Kuliah Kita</h1>
          <p className="text-gray-500 text-sm mt-1">
            Platform Perkuliahan
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setTab("mahasiswa"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "mahasiswa"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Mahasiswa
            </button>
            <button
              onClick={() => { setTab("dosen"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "dosen"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Dosen
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit}>
            {tab === "mahasiswa" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIM
                  </label>
                  <input
                    name="nim"
                    type="text"
                    required
                    placeholder="Masukkan NIM"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="dosen@email.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {tab === "mahasiswa" && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Belum terdaftar?{" "}
              <Link href="/register" className="text-emerald-700 font-medium hover:underline">
                Daftar di sini
              </Link>
            </p>
          )}

          {tab === "dosen" && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link href="/register?role=dosen" className="text-emerald-700 font-medium hover:underline">
                Daftar sebagai dosen
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
