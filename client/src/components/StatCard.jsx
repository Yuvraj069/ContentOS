// Stat card — reused across Dashboard for key metrics
export default function StatCard({ label, value, sublabel, highlight }) {
  return (
    <div className={'stat-card' + (highlight ? ' highlight-card' : '')}>
      <span className="stat-label">{label}</span>
      <span className="stat-number">{value}</span>
      {sublabel && <span className="stat-sublabel">{sublabel}</span>}
    </div>
  );
}
