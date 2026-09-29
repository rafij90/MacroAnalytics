import Link from "next/link";
import { notFound } from "next/navigation";
import { Chart } from "@/components/Chart";
import { SourceFooter } from "@/components/SourceFooter";
import { supabase } from "@/lib/supabase";

export default async function IndicatorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!supabase) return <main className="shell detail"><p className="notice">Configure Supabase to view indicator data.</p></main>;

  const { data: indicator, error } = await supabase.from("indicators").select("*, sources(name)").eq("code", code).maybeSingle();
  if (error) return <main className="shell detail"><p className="notice">Could not load this indicator.</p></main>;
  if (!indicator) notFound();

  const [{ data: observations }, { data: explanation }] = await Promise.all([
    supabase.from("observations").select("date, value").eq("indicator_id", indicator.id).order("date"),
    supabase.from("explanations").select("text, kind, generated_at").eq("indicator_id", indicator.id).eq("kind", "latest_release").maybeSingle(),
  ]);

  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">macro<span>analytics</span></Link><Link className="nav" href={`/country/${encodeURIComponent(indicator.country)}`}>{indicator.country}</Link></header>
    <article className="detail">
      <div className="eyebrow">{indicator.category ?? "Economic indicator"} · {indicator.country}</div>
      <h1>{indicator.name}</h1>
      <p className="muted">{indicator.frequency ? `${indicator.frequency} data` : "Historical series"}{indicator.unit ? ` · ${indicator.unit}` : ""}</p>
      <div className="chart-frame"><Chart rows={observations ?? []} unit={indicator.unit} /></div>
      {explanation?.text ? <section className="notice"><strong>Latest release · AI-generated</strong><p>{explanation.text}</p></section> : null}
      <SourceFooter sourceName={indicator.sources?.name} sourceUrl={indicator.source_url} lastUpdated={indicator.last_updated} />
    </article>
  </main>;
}