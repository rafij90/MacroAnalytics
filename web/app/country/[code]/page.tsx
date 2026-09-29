import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!supabase) return <main className="shell detail"><p className="notice">Configure Supabase to view country indicators.</p></main>;

  const { data, error } = await supabase
    .from("series")
    .select("countries(name), indicators!inner(code, name, unit, category_code, categories(name))")
    .eq("country_code", code.toUpperCase());
  if (error) return <main className="shell detail"><p className="notice">Could not load country indicators.</p></main>;
  if (!data?.length) notFound();

  const indicators = new Map<string, { code: string; name: string; unit: string | null; categories: { name: string } | null }>();
  for (const row of data) {
    const indicator = Array.isArray(row.indicators) ? row.indicators[0] : row.indicators;
    if (indicator) {
      const category = Array.isArray(indicator.categories) ? indicator.categories[0] : indicator.categories;
      indicators.set(indicator.code, {
        code: indicator.code,
        name: indicator.name,
        unit: indicator.unit,
        categories: category ?? null,
      });
    }
  }
  const countryRelation = data[0]?.countries;
  const country = Array.isArray(countryRelation) ? countryRelation[0] : countryRelation;
  const countryName = country?.name ?? code.toUpperCase();

  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">macro<span>analytics</span></Link><Link className="nav" href="/">All indicators</Link></header>
    <section className="detail"><div className="eyebrow">Country profile</div><h1>{countryName} indicators</h1>
      <div className="grid">{[...indicators.values()].map((item) => <Link className="card" href={`/indicator/${encodeURIComponent(item.code)}`} key={item.code}><span className="tag">{item.categories?.name ?? "Macro"}</span><h3>{item.name}</h3><span className="muted">{item.unit ?? "Explore series"}</span></Link>)}</div>
    </section>
  </main>;
}