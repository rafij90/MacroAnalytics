# MacroAnalytics

An MVP for collecting macroeconomic time series into Supabase and serving them through a Next.js website. The site reads only from the database; data providers are accessed by the scheduled Python pipeline.

## Repository layout

- `pipeline/` — source fetchers and Supabase update job.
- `web/` — Next.js App Router frontend.
- `supabase/schema.sql` — database tables and public read-only RLS policies.
- `.github/workflows/update.yml` — scheduled pipeline run.

## Setup

1. Create a Supabase project. `supabase/schema.sql` reflects the normalized schema in this repository and adds public read-only RLS policies. If you already created these tables from your SQL, running the file again is safe for the tables and policies.
2. Add rows to `categories`, `countries`, and `publishers`, then create `indicators` and provider-specific `series`. Each series' `source_series_id` is the identifier used by its provider. The pipeline currently recognizes publisher codes `FRED`, `WB`/`WORLD_BANK`, and loads actuals only for those providers.
3. For local pipeline runs, copy `.env.example` to `.env`, fill in the values, and install `pipeline/requirements.txt`.
4. Add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `FRED_API_KEY` as GitHub Actions repository secrets. The service key must only be used by the pipeline, never by the website.
5. In `web/`, install dependencies, copy `.env.local.example` to `.env.local`, set the Supabase URL and publishable/anon key, then run the development server.

The frontend's public key is safe to expose only because RLS limits `anon` and `authenticated` to reading these tables. The pipeline's service key bypasses RLS; never expose it to the website.

## Run locally

```sh
python -m pip install -r pipeline/requirements.txt
python -m pipeline.run_update
```

```sh
cd web
npm install
npm run dev
```

The included FRED and World Bank fetchers write into `actuals`; the indicator pages display actuals and the latest forecast vintage already present in `forecasts`. Forecast ingestion is not automated yet. IMF and RBI fetchers are placeholders; AI explanation generation is not configured because no LLM provider/key was selected. Explanation rows are keyed by `indicator_code`. The GitHub Actions workflow currently refreshes actuals only.

If your Supabase project still has tables from the earlier `sources`/`observations` design, migrate those tables to the normalized schema before running the app or pipeline.