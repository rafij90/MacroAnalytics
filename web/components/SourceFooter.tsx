type Source = { code: string; name: string; url: string | null; lastUpdated: string | null };

export function SourceFooter({ sources }: { sources: Source[] }) {
  return <footer className="footer">
    {sources.length ? sources.map((source) => <div key={source.code}>
      <span>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a> : source.name}</span>
      <span>{source.lastUpdated ? ` · Updated ${new Date(`${source.lastUpdated}Z`).toLocaleDateString()}` : " · Update time not available"}</span>
    </div>) : <span>Sources not specified.</span>}
  </footer>;
}