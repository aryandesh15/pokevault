type KpiCardProps = {
  value: number;
  label: string;
};

function KpiCard({ value, label }: KpiCardProps) {
  return (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}

export default KpiCard;