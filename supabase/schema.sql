-- Kuliah Kita LMS - Database Schema
-- Run this in your Supabase SQL Editor

-- Dosen table
create table dosen (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  nama varchar(255) not null,
  created_at timestamptz default now()
);

-- Mahasiswa table
create table mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nim varchar(20) unique not null,
  nama varchar(255) not null,
  created_at timestamptz default now()
);

-- Mata Kuliah table
create table mata_kuliah (
  id uuid primary key default gen_random_uuid(),
  kode varchar(20) unique not null,
  nama varchar(255) not null,
  deskripsi text,
  dosen_id uuid references dosen(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Enrollment (mahasiswa <-> mata_kuliah)
create table enrollment (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid references mahasiswa(id) on delete cascade not null,
  mk_id uuid references mata_kuliah(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(mahasiswa_id, mk_id)
);

-- Pertemuan table
create table pertemuan (
  id uuid primary key default gen_random_uuid(),
  mk_id uuid references mata_kuliah(id) on delete cascade not null,
  judul varchar(255) not null,
  tanggal date not null,
  deskripsi text,
  absensi_buka boolean default false,
  created_at timestamptz default now()
);

-- Materi table
create table materi (
  id uuid primary key default gen_random_uuid(),
  pertemuan_id uuid references pertemuan(id) on delete cascade not null,
  tipe varchar(10) not null check (tipe in ('dokumen', 'video')),
  nama_file varchar(255),
  url varchar(1000) not null,
  created_at timestamptz default now()
);

-- Absensi table
create table absensi (
  id uuid primary key default gen_random_uuid(),
  pertemuan_id uuid references pertemuan(id) on delete cascade not null,
  mahasiswa_id uuid references mahasiswa(id) on delete cascade not null,
  waktu timestamptz default now(),
  unique(pertemuan_id, mahasiswa_id)
);

-- Tugas table
create table tugas (
  id uuid primary key default gen_random_uuid(),
  pertemuan_id uuid references pertemuan(id) on delete cascade not null,
  judul varchar(255) not null,
  deskripsi text,
  deadline timestamptz not null,
  created_at timestamptz default now()
);

-- Submission table
create table submission (
  id uuid primary key default gen_random_uuid(),
  tugas_id uuid references tugas(id) on delete cascade not null,
  mahasiswa_id uuid references mahasiswa(id) on delete cascade not null,
  file_url varchar(1000) not null,
  nama_file varchar(255),
  waktu_submit timestamptz default now(),
  unique(tugas_id, mahasiswa_id)
);

-- Create storage bucket for uploads
insert into storage.buckets (id, name, public) values ('materi', 'materi', true);
insert into storage.buckets (id, name, public) values ('tugas', 'tugas', true);

-- Storage policies (allow all for MVP - tighten in production)
create policy "Allow public read materi" on storage.objects for select using (bucket_id = 'materi');
create policy "Allow authenticated upload materi" on storage.objects for insert with check (bucket_id = 'materi');
create policy "Allow public read tugas" on storage.objects for select using (bucket_id = 'tugas');
create policy "Allow authenticated upload tugas" on storage.objects for insert with check (bucket_id = 'tugas');
