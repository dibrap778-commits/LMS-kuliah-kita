"use client";

import { useMemo, useState } from "react";
import { enrollMataKuliah, unenrollMataKuliah } from "@/lib/actions/matakuliah";

type MK = {
  id: string; kode: string; nama: string; deskripsi: string | null;
  semester: number | null; dosenNama: string | null;
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function KelolaMKList({
  semua,
  diambilIds,
}: {
  semua: MK[];
  diambilIds: string[];
}) {
  const [taken, setTaken] = useState<Set<string>>(new Set(diambilIds));
  const [loadingId, setLoadingId] = useState<string>("");
  const [errorId, setErrorId] = useState<{ id: string; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"semua" | number>("semua");
  const [query, setQuery] = useState("");

  async function handleToggle(mkId: string, isTaken: boolean) {
    setLoadingId(mkId);
    setErrorId(null);
    const res = isTaken
      ? await unenrollMataKuliah(mkId)
      : await enrollMataKuliah(mkId);
    setLoadingId("");
    if (res?.error) {
      setErrorId({ id: mkId, msg: res.error });
      return;
    }
    setTaken((prev) => {
      const next = new Set(prev);
      if (isTaken) next.delete(mkId);
      else next.add(mkId);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return semua.filter((mk) => {
      const matchTab = activeTab === "semua" || mk.semester === activeTab;
      const matchQuery = !q ||
        mk.kode.toLowerCase().includes(q) ||
        mk.nama.toLowerCase().includes(q) ||
        (mk.dosenNama?.toLowerCase().includes(q) ?? false);
      return matchTab && matchQuery;
    });
  }, [semua, activeTab, query]);

  if (semua.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Belum ada mata kuliah tersedia.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kode, nama MK, atau dosen..."
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: "1.5px solid #DFDEDA", fontSize: 14,
            fontFamily: "inherit", background: "#fff", boxSizing: "border-box"
          }}
        />
      </div>

      {/* Semester tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
        {(["semua", ...SEMESTERS] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                cursor: "pointer", whiteSpace: "nowrap",
                background: isActive ? "#185B37" : "#fff",
                color: isActive ? "#fff" : "#65635d",
                border: isActive ? "1px solid #185B37" : "1px solid rgba(0,0,0,.12)",
              }}
            >
              {tab === "semua" ? "Semua" : `Semester ${tab}`}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Tidak ada mata kuliah yang cocok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((mk) => {
            const isTaken = taken.has(mk.id);
            const isLoading = loadingId === mk.id;
            return (
              <div
                key={mk.id}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-emerald-700">{mk.kode}</span>
                    {mk.semester && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                        Sem {mk.semester}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-sm text-gray-900">{mk.nama}</div>
                  {mk.dosenNama && (
                    <div className="text-xs text-gray-500 mt-0.5">👤 {mk.dosenNama}</div>
                  )}
                  {mk.deskripsi && (
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mk.deskripsi}</div>
                  )}
                  {errorId?.id === mk.id && (
                    <div className="text-xs text-red-600 mt-1">{errorId.msg}</div>
                  )}
                </div>
                <button
                  onClick={() => handleToggle(mk.id, isTaken)}
                  disabled={isLoading}
                  style={{
                    flexShrink: 0, padding: "7px 16px", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    cursor: isLoading ? "default" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    background: isTaken ? "#fef2f2" : "#185B37",
                    color: isTaken ? "#b91c1c" : "#fff",
                    border: isTaken ? "1px solid #fecaca" : "none",
                  }}
                >
                  {isLoading ? "..." : isTaken ? "Keluar" : "+ Daftar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
