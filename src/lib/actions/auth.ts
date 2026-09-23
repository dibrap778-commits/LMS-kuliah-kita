"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { createSession, deleteSession } from "@/lib/auth";

export async function loginDosen(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerClient();
  const { data: dosen } = await supabase
    .from("dosen")
    .select("*")
    .eq("email", email)
    .single();

  if (!dosen) return { error: "Email tidak ditemukan" };

  const valid = await bcrypt.compare(password, dosen.password_hash);
  if (!valid) return { error: "Password salah" };

  await createSession({
    id: dosen.id,
    role: "dosen",
    nama: dosen.nama,
    email: dosen.email,
  });

  redirect("/dosen");
}

export async function loginMahasiswa(formData: FormData) {
  const nim = formData.get("nim") as string;

  const supabase = createServerClient();
  const { data: mhs } = await supabase
    .from("mahasiswa")
    .select("*")
    .eq("nim", nim)
    .single();

  if (!mhs) return { error: "NIM tidak ditemukan. Silakan daftar terlebih dahulu." };

  await createSession({
    id: mhs.id,
    role: "mahasiswa",
    nama: mhs.nama,
    nim: mhs.nim,
  });

  redirect("/mahasiswa");
}

export async function registerMahasiswa(formData: FormData) {
  const nim = formData.get("nim") as string;
  const nama = formData.get("nama") as string;
  const mkIds = formData.getAll("mk_id") as string[];

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("mahasiswa")
    .select("id")
    .eq("nim", nim)
    .single();

  if (existing) return { error: "NIM sudah terdaftar" };

  const { data: mhs, error } = await supabase
    .from("mahasiswa")
    .insert({ nim, nama })
    .select()
    .single();

  if (error) return { error: "Gagal mendaftar" };

  if (mkIds.length > 0) {
    const enrollments = mkIds.map((mk_id) => ({
      mahasiswa_id: mhs.id,
      mk_id,
    }));
    await supabase.from("enrollment").insert(enrollments);
  }

  await createSession({
    id: mhs.id,
    role: "mahasiswa",
    nama: mhs.nama,
    nim: mhs.nim,
  });

  redirect("/mahasiswa");
}

export async function registerDosen(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nama = formData.get("nama") as string;

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("dosen")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) return { error: "Email sudah terdaftar" };

  const password_hash = await bcrypt.hash(password, 10);

  const { data: dosen, error } = await supabase
    .from("dosen")
    .insert({ email, password_hash, nama })
    .select()
    .single();

  if (error) return { error: "Gagal mendaftar" };

  await createSession({
    id: dosen.id,
    role: "dosen",
    nama: dosen.nama,
    email: dosen.email,
  });

  redirect("/dosen");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
