"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerMahasiswa, registerDosen } from "@/lib/actions/auth";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [isDosen, setIsDosen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mataKuliah, setMataKuliah] = useState<
    { id: string; kode: string; nama: string }[]
  >([]);

  useEffect(() => {
    if (searchParams.get("role") === "dosen") setIsDosen(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isDosen) {
      fetch("/api/matakuliah")
        .then((r) => r.json())
        .then((data) => setMataKuliah(data))
        .catch(() => {});
    }
  }, [isDosen]);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-emerald-700">Kuliah Kita</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isDosen ? "Registrasi Dosen" : "Registrasi Mahasiswa"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit}>
            <div className="space-y-4">
              {isDosen ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      name="nama"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
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
                      minLength={6}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIM
                    </label>
                    <input
                      name="nim"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      name="nama"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {mataKuliah.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Mata Kuliah
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {mataKuliah.map((mk) => (
                          <label key={mk.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="mk_id"
                              value={mk.id}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>
                              {mk.kode} — {mk.nama}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-emerald-700 font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
