export function SourceFooter({ sourceName, sourceUrl, lastUpdated }: { sourceName?: string | null; sourceUrl?: string | null; lastUpdated?: string | null }) {
  return <footer className="footer">
    <span>Source: {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">{sourceName ?? "View original data"} ↗</a> : sourceName ?? "Not specified"}</span>
    <span>{lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleDateString()}` : " · Update time not available"}</span>
  </footer>;
}