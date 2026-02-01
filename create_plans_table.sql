-- AIプランを保存するテーブルを作成
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシー（必要に応じて有効化）
alter table plans enable row level security;

create policy "Enable read access for all users" on plans
  for select using (true);

create policy "Enable insert access for all users" on plans
  for insert with check (true);
