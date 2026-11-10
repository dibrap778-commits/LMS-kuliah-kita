-- Jumlah maksimal percobaan kuis yang bisa diatur dosen per kuis
-- Jalankan di Supabase SQL Editor

alter table kuis add column if not exists maks_attempt int not null default 1;
