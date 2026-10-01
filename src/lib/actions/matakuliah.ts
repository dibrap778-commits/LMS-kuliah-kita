"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function createMataKuliah(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const kode = formData.get("kode") as string;
  const nama = formData.get("nama") as string;
  const deskripsi = formData.get("deskripsi") as string;

  const supabase = createServerClient();

  const { error } = await supabase.from("mata_kuliah").insert({
    kode,
    nama,
    deskripsi,
    dosen_id: session.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "Kode MK sudah digunakan" };
    return { error: "Gagal membuat mata kuliah" };
  }

  redirect("/dosen");
}

export async function deleteMataKuliah(id: string) {
  const session = await getSession();
  if (!session || session.role !== "dosen") return { error: "Unauthorized" };

  const supabase = createServerClient();
  await supabase.from("mata_kuliah").delete().eq("id", id).eq("dosen_id", session.id);
  redirect("/dosen");
}

export async function enrollMataKuliah(mkId: string) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("enrollment")
    .insert({ mahasiswa_id: session.id, mk_id: mkId });

  if (error) {
    if (error.code === "23505") return { error: "Sudah terdaftar di mata kuliah ini" };
    return { error: "Gagal mendaftar mata kuliah" };
  }

  revalidatePath("/mahasiswa");
  revalidatePath("/mahasiswa/kelola-mk");
  return { success: true };
}

export async function unenrollMataKuliah(mkId: string) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") return { error: "Unauthorized" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("enrollment")
    .delete()
    .eq("mahasiswa_id", session.id)
    .eq("mk_id", mkId);

  if (error) return { error: "Gagal keluar dari mata kuliah" };

  revalidatePath("/mahasiswa");
  revalidatePath("/mahasiswa/kelola-mk");
  return { success: true };
}
