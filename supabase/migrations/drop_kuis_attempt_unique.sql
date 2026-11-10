-- Hapus unique constraint lama (1 attempt per kuis+mahasiswa) supaya
-- fitur multi-percobaan kuis bisa menyimpan lebih dari satu baris attempt
-- Jalankan di Supabase SQL Editor

alter table kuis_attempt drop constraint if exists kuis_attempt_kuis_id_mahasiswa_id_key;
