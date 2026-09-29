create table if not exists public.sources (
  id serial primary key,
  name text not null unique,
  url text,
  license_note text
);

create table if not exists public.indicators (
  id serial primary key,
  code text unique not null,
  name text not null,
  country text not null,
  category text,
  unit text,
  frequency text,
  source_id int references public.sources(id),
  source_series_id text,
  source_url text,
  last_updated timestamptz
);

create table if not exists public.observations (
  indicator_id int not null references public.indicators(id) on delete cascade,
  date date not null,
  value numeric,
  primary key (indicator_id, date)
);

create table if not exists public.explanations (
  indicator_id int not null references public.indicators(id) on delete cascade,
  kind text not null,
  text text,
  generated_at timestamptz default now(),
  primary key (indicator_id, kind)
);

alter table public.sources enable row level security;
alter table public.indicators enable row level security;
alter table public.observations enable row level security;
alter table public.explanations enable row level security;

create policy "public read sources" on public.sources for select to anon, authenticated using (true);
create policy "public read indicators" on public.indicators for select to anon, authenticated using (true);
create policy "public read observations" on public.observations for select to anon, authenticated using (true);
create policy "public read explanations" on public.explanations for select to anon, authenticated using (true);

grant select on public.sources, public.indicators, public.observations, public.explanations to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;