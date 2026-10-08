"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SoalInput = {
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: string;
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
  jawaban: { soal_id: string; jawaban_dipilih: string | null }[]
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
    .select("id, jawaban_benar")
    .eq("kuis_id", attempt.kuis_id);

  const kunci: Record<string, string> = {};
  for (const s of soalList || []) kunci[s.id] = s.jawaban_benar;

  let benar = 0;
  const rows = jawaban
    .filter((j) => j.jawaban_dipilih !== null)
    .map((j) => {
      if (kunci[j.soal_id] && j.jawaban_dipilih === kunci[j.soal_id]) benar++;
      return { attempt_id: attemptId, soal_id: j.soal_id, jawaban_dipilih: j.jawaban_dipilih };
    });

  const total = soalList?.length || 1;
  const skor = Math.round((benar / total) * 100);

  if (rows.length > 0) await supabase.from("kuis_jawaban").insert(rows);
  await supabase
    .from("kuis_attempt")
    .update({ waktu_selesai: new Date().toISOString(), skor })
    .eq("id", attemptId);

  return { success: true, skor };
}
