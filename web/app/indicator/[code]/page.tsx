import Link from "next/link";
import { notFound } from "next/navigation";
import { Chart } from "@/components/Chart";
import { SourceFooter } from "@/components/SourceFooter";
import { supabase } from "@/lib/supabase";

type SeriesInfo = {
  code: string;
  country_code: string;
  publisher_code: string;
  source_url: string | null;
  last_updated: string | null;
  countries: { name: string } | null;
  publishers: { name: string } | null;
};
type ActualRow = { series_code: string; period_date: string; value: number | null };
type ForecastRow = ActualRow & { vintage_date: string };
type ExplanationRow = { kind: string; text: string | null; generated_at: string | null };

export default async function IndicatorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!supabase) return <main className="shell detail"><p className="notice">Configure Supabase to view indicator data.</p></main>;

  const { data: indicator, error } = await supabase
    .from("indicators")
    .select("*, categories(name), series(code, country_code, publisher_code, source_url, last_updated, has_actuals, has_forecasts, countries(name), publishers(name))")
    .eq("code", code)
    .maybeSingle();
  if (error) return <main className="shell detail"><p className="notice">Could not load this indicator.</p></main>;
  if (!indicator) notFound();

  const series = (indicator.series ?? []) as SeriesInfo[];
  const seriesCodes = series.map((item) => item.code);
  const [actualResult, forecastResult, explanationResult] = await Promise.all([
    seriesCodes.length
      ? supabase.from("actuals").select("series_code, period_date, value").in("series_code", seriesCodes).order("period_date")
      : Promise.resolve({ data: [] }),
    seriesCodes.length
      ? supabase.from("forecasts").select("series_code, period_date, vintage_date, value").in("series_code", seriesCodes).order("vintage_date", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from("explanations").select("text, kind, generated_at").eq("indicator_code", indicator.code).in("kind", ["definition", "latest_release"]),
  ]);

  const actualRows = (actualResult.data ?? []) as ActualRow[];
  const forecastRows = (forecastResult.data ?? []) as ForecastRow[];
  const explanations = (explanationResult.data ?? []) as ExplanationRow[];
  const chartSeries = series.map((item) => {
    const actuals = actualRows
      .filter((row) => row.series_code === item.code && row.value !== null)
      .map((row) => ({ date: row.period_date, value: Number(row.value) }));
    const seriesForecasts = forecastRows.filter((row) => row.series_code === item.code);
    const latestVintage = seriesForecasts[0]?.vintage_date;
    const forecasts = seriesForecasts
      .filter((row) => row.vintage_date === latestVintage)
      .filter((row) => row.value !== null)
      .map((row) => ({ date: row.period_date, value: Number(row.value) }));
    return {
      code: item.code,
      label: `${item.countries?.name ?? item.country_code} · ${item.publishers?.name ?? item.publisher_code}`,
      actuals,
      forecasts,
    };
  });
  const countryCode = series[0]?.country_code;
  const definition = explanations.find((item) => item.kind === "definition")?.text;
  const latestRelease = explanations.find((item) => item.kind === "latest_release")?.text;

  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">macro<span>analytics</span></Link>{countryCode ? <Link className="nav" href={`/country/${encodeURIComponent(countryCode)}`}>{countryCode}</Link> : null}</header>
    <article className="detail">
      <div className="eyebrow">{indicator.categories?.name ?? "Economic indicator"}</div>
      <h1>{indicator.name}</h1>
      <p className="muted">{indicator.frequency ? `${indicator.frequency} data` : "Historical series"}{indicator.measure_type ? ` · ${indicator.measure_type.replaceAll("_", " ")}` : ""}{indicator.unit ? ` · ${indicator.unit}` : ""}</p>
      <div className="chart-frame"><Chart series={chartSeries} unit={indicator.unit} /></div>
      {definition ? <section className="notice"><strong>About this indicator</strong><p>{definition}</p></section> : null}
      {latestRelease ? <section className="notice"><strong>Latest release · AI-generated</strong><p>{latestRelease}</p></section> : null}
      <SourceFooter sources={series.map((item) => ({
        code: item.code,
        name: item.publishers?.name ?? item.publisher_code,
        url: item.source_url,
        lastUpdated: item.last_updated,
      }))} />
    </article>
  </main>;
}