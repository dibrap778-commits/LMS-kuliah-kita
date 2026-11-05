"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SoalInput = {
  tipe: "pilihan_ganda" | "esai";
  pertanyaan: string;
  pilihan_a: string | null;
  pilihan_b: string | null;
  pilihan_c: string | null;
  pilihan_d: string | null;
  jawaban_benar: string | null;
};

export async function createKuis(
  pertemuanId: string,
  mkId: string,
  judul: string,
  durasiMenit: number
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("kuis")
    .insert({ pertemuan_id: pertemuanId, judul, durasi_menit: durasiMenit })
    .select()
    .single();

  if (error) return { error: "Gagal membuat kuis" };

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  return { success: true, id: data.id };
}

export async function editKuis(
  kuisId: string,
  pertemuanId: string,
  mkId: string,
  judul: string,
  durasiMenit: number
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("kuis")
    .update({ judul, durasi_menit: durasiMenit })
    .eq("id", kuisId);

  if (error) return { error: "Gagal mengubah kuis" };

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${kuisId}`);
  return { success: true };
}

export async function deleteKuis(kuisId: string, pertemuanId: string, mkId: string) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  await supabase.from("kuis").delete().eq("id", kuisId);

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  return { success: true };
}

export async function addSoal(
  kuisId: string,
  pertemuanId: string,
  mkId: string,
  data: SoalInput & { urutan: number }
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase.from("kuis_soal").insert({ kuis_id: kuisId, ...data });

  if (error) return { error: "Gagal menambah soal" };

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${kuisId}`);
  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  return { success: true };
}

export async function editSoal(
  soalId: string,
  kuisId: string,
  pertemuanId: string,
  mkId: string,
  data: SoalInput
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase.from("kuis_soal").update(data).eq("id", soalId);

  if (error) return { error: "Gagal mengubah soal" };

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${kuisId}`);
  return { success: true };
}

export async function deleteSoal(
  soalId: string,
  kuisId: string,
  pertemuanId: string,
  mkId: string
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  await supabase.from("kuis_soal").delete().eq("id", soalId);

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${kuisId}`);
  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  return { success: true };
}

export async function startAttempt(kuisId: string) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("kuis_attempt")
    .select("id")
    .eq("kuis_id", kuisId)
    .eq("mahasiswa_id", session.id)
    .single();

  if (existing) return { success: true, attemptId: existing.id };

  const { data, error } = await supabase
    .from("kuis_attempt")
    .insert({ kuis_id: kuisId, mahasiswa_id: session.id })
    .select()
    .single();

  if (error) return { error: "Gagal memulai kuis" };
  return { success: true, attemptId: data.id };
}

export async function submitAttempt(
  attemptId: string,
  jawaban: { soal_id: string; jawaban_dipilih: string | null; jawaban_esai?: string | null }[],
  pelanggaran: number = 0
) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const supabase = createServerClient();

  const { data: attempt } = await supabase
    .from("kuis_attempt")
    .select("*")
    .eq("id", attemptId)
    .eq("mahasiswa_id", session.id)
    .single();

  if (!attempt) return { error: "Attempt tidak ditemukan" };
  if (attempt.waktu_selesai) return { success: true, skor: attempt.skor };

  const { data: soalList } = await supabase
    .from("kuis_soal")
    .select("id, tipe, jawaban_benar")
    .eq("kuis_id", attempt.kuis_id);

  const soalMap: Record<string, { tipe: string; jawaban_benar: string | null }> = {};
  for (const s of soalList || []) soalMap[s.id] = s;

  const rows = jawaban
    .filter((j) => j.jawaban_dipilih !== null || (j.jawaban_esai && j.jawaban_esai.trim() !== ""))
    .map((j) => ({
      attempt_id: attemptId,
      soal_id: j.soal_id,
      jawaban_dipilih: j.jawaban_dipilih ?? null,
      jawaban_esai: j.jawaban_esai?.trim() || null,
    }));

  if (rows.length > 0) await supabase.from("kuis_jawaban").insert(rows);

  const adaEsai = (soalList || []).some((s) => s.tipe === "esai");

  if (!adaEsai) {
    let benar = 0;
    for (const j of jawaban) {
      const s = soalMap[j.soal_id];
      if (s && j.jawaban_dipilih && j.jawaban_dipilih === s.jawaban_benar) benar++;
    }
    const total = soalList?.length || 1;
    const skor = Math.round((benar / total) * 100);
    await supabase
      .from("kuis_attempt")
      .update({ waktu_selesai: new Date().toISOString(), skor, pelanggaran })
      .eq("id", attemptId);
    return { success: true, skor };
  }

  // Ada soal esai: pilihan ganda dihitung di belakang layar, tapi skor final
  // baru dikunci setelah dosen menilai semua esai (lihat finalisasiSkor()).
  await supabase
    .from("kuis_attempt")
    .update({ waktu_selesai: new Date().toISOString(), skor: null, pelanggaran })
    .eq("id", attemptId);

  return { success: true, skor: null, pending: true };
}

async function finalisasiSkor(attemptId: string) {
  const supabase = createServerClient();

  const { data: attempt } = await supabase
    .from("kuis_attempt")
    .select("id, kuis_id")
    .eq("id", attemptId)
    .single();
  if (!attempt) return;

  const { data: soalList } = await supabase
    .from("kuis_soal")
    .select("id, tipe, jawaban_benar")
    .eq("kuis_id", attempt.kuis_id);

  const { data: jawabanList } = await supabase
    .from("kuis_jawaban")
    .select("soal_id, jawaban_dipilih, nilai")
    .eq("attempt_id", attemptId);

  const jawabanMap: Record<string, { jawaban_dipilih: string | null; nilai: number | null }> = {};
  for (const j of jawabanList || []) jawabanMap[j.soal_id] = j;

  const esaiSoal = (soalList || []).filter((s) => s.tipe === "esai");
  const semuaEsaiDinilai = esaiSoal.every((s) => {
    const n = jawabanMap[s.id]?.nilai;
    return n !== null && n !== undefined;
  });

  if (!semuaEsaiDinilai) return;

  const total = (soalList || []).length || 1;
  let totalFraksi = 0;
  for (const s of soalList || []) {
    if (s.tipe === "esai") {
      totalFraksi += (jawabanMap[s.id]?.nilai ?? 0) / 100;
    } else {
      const dipilih = jawabanMap[s.id]?.jawaban_dipilih;
      if (dipilih && dipilih === s.jawaban_benar) totalFraksi += 1;
    }
  }
  const skor = Math.round((totalFraksi / total) * 100);

  await supabase.from("kuis_attempt").update({ skor }).eq("id", attemptId);
}

export async function nilaiEsai(
  jawabanId: string,
  nilai: number,
  attemptId: string,
  kuisId: string,
  pertemuanId: string,
  mkId: string
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("kuis_jawaban")
    .update({ nilai: Math.max(0, Math.min(100, nilai)) })
    .eq("id", jawabanId);

  if (error) return { error: "Gagal menyimpan nilai esai" };

  await finalisasiSkor(attemptId);

  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}/kuis/${kuisId}`);
  revalidatePath(`/dosen/matakuliah/${mkId}`);
  return { success: true };
}
