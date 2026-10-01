"use client";

import { useState } from "react";
import { enrollMataKuliah, unenrollMataKuliah } from "@/lib/actions/matakuliah";

type MK = { id: string; kode: string; nama: string; deskripsi: string | null };

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

  if (semua.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Belum ada mata kuliah tersedia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {semua.map((mk) => {
        const isTaken = taken.has(mk.id);
        const isLoading = loadingId === mk.id;
        return (
          <div
            key={mk.id}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="text-xs font-mono text-emerald-700 mb-0.5">{mk.kode}</div>
              <div className="font-medium text-sm text-gray-900">{mk.nama}</div>
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
  );
}
