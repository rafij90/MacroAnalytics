import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Indicator = {
  code: string;
  name: string;
  unit: string | null;
  category: string | null;
  countries: string[];
};

export default async function HomePage() {
  let indicators: Indicator[] = [];
  let unavailable = !supabase;

  if (supabase) {
    const { data, error } = await supabase
      .from("indicators")
      .select("code, name, unit, categories(name), series(countries(name))")
      .order("name")
      .limit(12);
    indicators = (data ?? []).map((item) => {
      const category = Array.isArray(item.categories) ? item.categories[0] : item.categories;
      const countries = item.series.flatMap((seriesItem) => {
        const country = Array.isArray(seriesItem.countries) ? seriesItem.countries[0] : seriesItem.countries;
        return country?.name ? [country.name] : [];
      });
      return {
        code: item.code,
        name: item.name,
        unit: item.unit,
        category: category?.name ?? null,
        countries: [...new Set(countries)],
      };
    });
    unavailable = Boolean(error);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">macro<span>analytics</span></Link>
        <nav className="nav"><a href="#indicators">Indicators</a><a href="#about">About</a></nav>
      </header>
      <section className="hero" id="about">
        <div className="eyebrow">The numbers behind the news</div>
        <h1>Understand the economy, one indicator at a time.</h1>
        <p>Clear macroeconomic data, thoughtfully sourced and easy to explore. Follow the signals shaping countries and markets.</p>
      </section>
      <section id="indicators">
        <div className="section-head"><h2>Explore indicators</h2><span className="muted">India · United States · Global</span></div>
        {unavailable ? <p className="notice">Connect Supabase by setting the public environment variables and applying the database schema.</p> : null}
        {!unavailable && indicators.length === 0 ? <p className="notice">No indicators yet. Add records to the indicators table to get started.</p> : null}
        <div className="grid">
          {indicators.map((indicator) => (
            <Link className="card" href={`/indicator/${encodeURIComponent(indicator.code)}`} key={indicator.code}>
              <span className="tag">{indicator.category ?? "Macro"}</span>
              <h3>{indicator.name}</h3>
              <span className="muted">{indicator.countries.join(", ") || "Global"}{indicator.unit ? ` · ${indicator.unit}` : ""}</span>
            </Link>
          ))}
        </div>
      </section>
      <footer className="footer">Data sourced from public statistical agencies. Always check the linked source for context.</footer>
    </main>
  );
}