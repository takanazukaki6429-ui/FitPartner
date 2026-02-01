-- 体組成ログ（グラフ用）
create table if not exists body_composition_logs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  date date default CURRENT_DATE not null,
  weight numeric,
  body_fat_percentage numeric,
  muscle_mass numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- トレーニング実績ログ
create table if not exists training_logs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  date date default CURRENT_DATE not null,
  menu_name text not null,
  weight numeric,
  reps int,
  sets int,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS設定
alter table body_composition_logs enable row level security;
create policy "Enable all access for body_composition_logs" on body_composition_logs for all using (true) with check (true);

alter table training_logs enable row level security;
create policy "Enable all access for training_logs" on training_logs for all using (true) with check (true);
