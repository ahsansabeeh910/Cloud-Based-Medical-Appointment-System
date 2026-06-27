import './StatsCard.css';

export default function StatsCard({ icon, value, label, gradient, index = 0 }) {
  return (
    <div
      className="stats-card glass-card glass-card-hover animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
    >
      <div className="stats-card-icon" style={{ background: gradient || 'var(--gradient-primary)' }}>
        {icon}
      </div>
      <div className="stats-card-content">
        <span className="stats-card-value">{value}</span>
        <span className="stats-card-label">{label}</span>
      </div>
    </div>
  );
}
