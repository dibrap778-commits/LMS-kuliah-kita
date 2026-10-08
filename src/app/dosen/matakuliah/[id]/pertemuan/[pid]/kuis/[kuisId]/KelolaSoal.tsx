"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editKuis, addSoal, editSoal, deleteSoal } from "@/lib/actions/kuis";

type Soal = {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: string;
};

type Opt = "a" | "b" | "c" | "d";

const emptyForm = {
  pertanyaan: "", pilihan_a: "", pilihan_b: "", pilihan_c: "", pilihan_d: "", jawaban_benar: "a" as Opt,
};

export default function KelolaSoal({
  kuisId, pertemuanId, mkId, initialJudul, initialDurasi, soalList,
}: {
  kuisId: string; pertemuanId: string; mkId: string;
  initialJudul: string; initialDurasi: number; soalList: Soal[];
}) {
  const router = useRouter();

  const [editingHeader, setEditingHeader] = useState(false);
  const [judul, setJudul] = useState(initialJudul);
  const [durasi, setDurasi] = useState(String(initialDurasi));
  const [savingHeader, setSavingHeader] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSaveHeader() {
    if (!judul.trim() || !durasi) return;
    setSavingHeader(true);
    await editKuis(kuisId, pertemuanId, mkId, judul.trim(), Number(durasi));
    setSavingHeader(false);
    setEditingHeader(false);
    router.refresh();
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(s: Soal) {
    setEditingId(s.id);
    setForm({
      pertanyaan: s.pertanyaan,
      pilihan_a: s.pilihan_a,
      pilihan_b: s.pilihan_b,
      pilihan_c: s.pilihan_c,
      pilihan_d: s.pilihan_d,
      jawaban_benar: s.jawaban_benar as Opt,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSaveSoal() {
    const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d } = form;
    if (!pertanyaan.trim() || !pilihan_a.trim() || !pilihan_b.trim() || !pilihan_c.trim() || !pilihan_d.trim()) {
      setError("Semua field wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      pertanyaan: pertanyaan.trim(),
      pilihan_a: pilihan_a.trim(),
      pilihan_b: pilihan_b.trim(),
      pilihan_c: pilihan_c.trim(),
      pilihan_d: pilihan_d.trim(),
      jawaban_benar: form.jawaban_benar,
    };
    const res = editingId
      ? await editSoal(editingId, kuisId, pertemuanId, mkId, payload)
      : await addSoal(kuisId, pertemuanId, mkId, { ...payload, urutan: soalList.length });
    setSaving(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(soalId: string) {
    if (!confirm("Hapus soal ini?")) return;
    await deleteSoal(soalId, kuisId, pertemuanId, mkId);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 7,
    border: "1.5px solid #DFDEDA", fontSize: 13, fontFamily: "inherit",
    background: "#fff", display: "block", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Header kuis */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        {!editingHeader ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{judul}</h1>
              <p className="text-sm text-gray-500 mt-1">{soalList.length} soal · {durasi} menit</p>
            </div>
            <button
              onClick={() => setEditingHeader(true)}
              className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 flex-shrink-0"
            >
              ✏️ Edit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Judul Kuis</label>
              <input value={judul} onChange={(e) => setJudul(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Durasi (menit)</label>
              <input
                type="number" min={1} value={durasi}
                onChange={(e) => setDurasi(e.target.value)}
                style={{ ...inputStyle, width: 120 }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveHeader}
                disabled={savingHeader}
                className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
              >
                {savingHeader ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => { setEditingHeader(false); setJudul(initialJudul); setDurasi(String(initialDurasi)); }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daftar soal */}
      <div className="space-y-3 mb-4">
        {soalList.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-gray-900">{i + 1}. {s.pertanyaan}</p>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
              </div>
            </div>
            <div className="space-y-1">
              {(["a", "b", "c", "d"] as const).map((opt) => (
                <div
                  key={opt}
                  style={{
                    fontSize: 13, padding: "4px 10px", borderRadius: 6,
                    color: s.jawaban_benar === opt ? "#177a4d" : "#65635d",
                    background: s.jawaban_benar === opt ? "#eafaf1" : "transparent",
                    fontWeight: s.jawaban_benar === opt ? 600 : 400,
                  }}
                >
                  {opt.toUpperCase()}. {s[`pilihan_${opt}` as keyof Soal]}
                  {s.jawaban_benar === opt && " ✓"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form tambah/edit soal */}
      {!showForm ? (
        <button
          onClick={openAdd}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
        >
          + Tambah Soal
        </button>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            {editingId ? "Edit Soal" : "Soal Baru"}
          </div>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pertanyaan</label>
              <textarea
                value={form.pertanyaan}
                onChange={(e) => setForm((f) => ({ ...f, pertanyaan: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            {(["a", "b", "c", "d"] as const).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="jawaban_benar"
                  checked={form.jawaban_benar === opt}
                  onChange={() => setForm((f) => ({ ...f, jawaban_benar: opt }))}
                  style={{ accentColor: "#185B37", flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#65635d", width: 16, flexShrink: 0 }}>
                  {opt.toUpperCase()}
                </span>
                <input
                  value={form[`pilihan_${opt}` as "pilihan_a" | "pilihan_b" | "pilihan_c" | "pilihan_d"]}
                  onChange={(e) => setForm((f) => ({ ...f, [`pilihan_${opt}`]: e.target.value }))}
                  placeholder={`Pilihan ${opt.toUpperCase()}`}
                  style={inputStyle}
                />
              </div>
            ))}
            <p className="text-xs text-gray-400">Pilih radio di samping opsi yang merupakan jawaban benar.</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveSoal}
              disabled={saving}
              className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Soal"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
