create table if not exists public.categories (
  code varchar(30) primary key,
  name varchar(100) not null,
  sort_order int default 0
);

create table if not exists public.countries (
  code varchar(3) primary key,
  name varchar(100) not null
);

create table if not exists public.publishers (
  code varchar(30) primary key,
  name varchar(150) not null,
  url varchar(300),
  license_note varchar(500)
);

create table if not exists public.indicators (
  code varchar(50) primary key,
  category_code varchar(30) not null references public.categories(code),
  name varchar(150) not null,
  price_basis varchar(20),
  measure_type varchar(30),
  unit varchar(30),
  frequency varchar(20),
  description text
);

create table if not exists public.series (
  code varchar(80) primary key,
  indicator_code varchar(50) not null references public.indicators(code),
  country_code varchar(3) not null references public.countries(code),
  publisher_code varchar(30) not null references public.publishers(code),
  has_actuals boolean default true,
  has_forecasts boolean default false,
  source_series_id varchar(100),
  source_url varchar(500),
  last_updated timestamp
);

create table if not exists public.actuals (
  series_code varchar(80) not null references public.series(code),
  period_date date not null,
  value decimal(20,6),
  primary key (series_code, period_date)
);

create table if not exists public.forecasts (
  series_code varchar(80) not null references public.series(code),
  period_date date not null,
  vintage_date date not null,
  value decimal(20,6),
  primary key (series_code, period_date, vintage_date)
);

create table if not exists public.explanations (
  indicator_code varchar(50) not null references public.indicators(code),
  kind varchar(30) not null,
  text text,
  generated_at timestamp,
  primary key (indicator_code, kind)
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'categories', 'countries', 'publishers', 'indicators',
    'series', 'actuals', 'forecasts', 'explanations'
  ] loop
    execute format('alter table public.%I enable row level security', target_table);
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
        and policyname = 'public read'
    ) then
      execute format(
        'create policy "public read" on public.%I for select to anon, authenticated using (true)',
        target_table
      );
    end if;
  end loop;
end;
$$;

grant select on public.categories, public.countries, public.publishers,
  public.indicators, public.series, public.actuals, public.forecasts,
  public.explanations to anon, authenticated;