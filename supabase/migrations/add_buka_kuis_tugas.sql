-- Kunci/buka kuis dan tugas secara individual, mirip pola absensi_buka
-- Jalankan di Supabase SQL Editor

alter table kuis add column if not exists buka boolean not null default false;
update kuis set buka = true where buka is false; -- kuis yang sudah ada tetap bisa diakses seperti sebelumnya

alter table tugas add column if not exists buka boolean not null default true;
