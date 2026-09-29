"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveNilai(
  mahasiswaId: string,
  mkId: string,
  field: "tugas" | "uts" | "uas",
  value: number | null
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase.from("nilai").upsert(
    { mahasiswa_id: mahasiswaId, mk_id: mkId, [field]: value },
    { onConflict: "mahasiswa_id,mk_id" }
  );

  if (error) return { error: "Gagal menyimpan nilai" };
  revalidatePath(`/dosen/matakuliah/${mkId}`);
  return { success: true };
}

export async function saveNilaiSubmission(
  submissionId: string,
  nilai: number,
  feedback: string,
  pertemuanId: string,
  mkId: string
) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("submission")
    .update({ nilai, feedback })
    .eq("id", submissionId);

  if (error) return { error: "Gagal menyimpan nilai" };
  revalidatePath(`/dosen/matakuliah/${mkId}/pertemuan/${pertemuanId}`);
  revalidatePath(`/dosen/matakuliah/${mkId}`);
  return { success: true };
}
