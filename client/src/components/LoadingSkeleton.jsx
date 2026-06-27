export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const renderSkeleton = (i) => {
    switch (type) {
      case 'card':
        return (
          <div key={i} className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="skeleton skeleton-circle" style={{ width: 56, height: 56, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
              <div className="skeleton" style={{ width: 80, height: 28 }} />
              <div className="skeleton" style={{ width: 140, height: 36, borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
        );

      case 'stats':
        return (
          <div key={i} className="glass-card" style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 6 }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          </div>
        );

      case 'list':
        return (
          <div key={i} className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '50%' }} />
              <div className="skeleton skeleton-text" style={{ width: '30%' }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 'var(--radius-full)' }} />
          </div>
        );

      default:
        return <div key={i} className="skeleton skeleton-card" />;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
    </>
  );
}
