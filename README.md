# MacroAnalytics

An MVP for collecting macroeconomic time series into Supabase and serving them through a Next.js website. The site reads only from the database; data providers are accessed by the scheduled Python pipeline.

## Repository layout

- `pipeline/` — source fetchers and Supabase update job.
- `web/` — Next.js App Router frontend.
- `supabase/schema.sql` — database tables and public read-only RLS policies.
- `.github/workflows/update.yml` — scheduled pipeline run.

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Add source rows and indicators in Supabase. The `indicators.source_series_id` is the source's series/indicator identifier; `sources.name` must be `FRED` or `World Bank` for the included fetchers.
3. For local pipeline runs, copy `.env.example` to `.env`, fill in the values, and install `pipeline/requirements.txt`.
4. Add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `FRED_API_KEY` as GitHub Actions repository secrets. The service key must only be used by the pipeline, never by the website.
5. In `web/`, install dependencies, copy `.env.local.example` to `.env.local`, set the Supabase URL and publishable/anon key, then run the development server.

The frontend's public key is safe to expose only because the schema enables RLS and grants public users read access only. Do not add write policies for `anon` or expose the service key.

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

The included FRED and World Bank fetchers are implemented. IMF and RBI modules are explicit placeholders; AI explanation generation is also not configured because no LLM provider/key was selected. The GitHub Actions workflow currently refreshes data only.