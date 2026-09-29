import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!supabase) return <main className="shell detail"><p className="notice">Configure Supabase to view country indicators.</p></main>;

  const { data, error } = await supabase.from("indicators").select("code, name, category, unit").eq("country", code.toUpperCase()).order("name");
  if (error) return <main className="shell detail"><p className="notice">Could not load country indicators.</p></main>;
  if (!data?.length) notFound();

  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">macro<span>analytics</span></Link><Link className="nav" href="/">All indicators</Link></header>
    <section className="detail"><div className="eyebrow">Country profile</div><h1>{code.toUpperCase()} indicators</h1>
      <div className="grid">{data.map((item) => <Link className="card" href={`/indicator/${encodeURIComponent(item.code)}`} key={item.code}><span className="tag">{item.category ?? "Macro"}</span><h3>{item.name}</h3><span className="muted">{item.unit ?? "Explore series"}</span></Link>)}</div>
    </section>
  </main>;
}