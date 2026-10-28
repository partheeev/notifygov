import React from 'react';

export type SourceHealthStatus = 'healthy' | 'active' | 'warning' | 'error' | 'offline';

export interface SourceBadgeProps {
  name: string;
  healthStatus?: SourceHealthStatus;
  className?: string;
}

export default function SourceBadge({
  name,
  healthStatus = 'healthy',
  className = '',
}: SourceBadgeProps) {
  // Dot color matching status
  const getDotStyle = (status: SourceHealthStatus) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return {
          backgroundColor: '#10b981',
          boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
        };
      case 'error':
      case 'offline':
        return {
          backgroundColor: '#ef4444',
          boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
        };
      default:
        return {
          backgroundColor: '#94a3b8',
          boxShadow: 'none',
        };
    }
  };

  const getStatusLabel = (status: SourceHealthStatus) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'Verified official feed online';
      case 'warning':
        return 'Delayed feed updates';
      case 'error':
      case 'offline':
        return 'Portal temporarily unreachable';
      default:
        return 'Feed status unknown';
    }
  };

  return (
    <div
      className={`source-badge ${className}`}
      title={`${name} — ${getStatusLabel(healthStatus)}`}
    >
      <span className="source-dot" style={getDotStyle(healthStatus)} />
      <span className="source-name">{name}</span>
    </div>
  );
}
