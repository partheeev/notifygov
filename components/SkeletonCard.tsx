import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card glass-card">
      <div className="skeleton-left-accent" />

      <div className="skeleton-content">
        {/* Top meta row */}
        <div className="skeleton-header">
          <div className="skeleton-box skeleton-org skeleton-shimmer" />
          <div className="skeleton-box skeleton-cat skeleton-shimmer" />
        </div>

        {/* Title (2 lines) */}
        <div className="skeleton-title-group">
          <div className="skeleton-box skeleton-title-line-1 skeleton-shimmer" />
          <div className="skeleton-box skeleton-title-line-2 skeleton-shimmer" />
        </div>

        {/* Summary (3 lines) */}
        <div className="skeleton-summary-group">
          <div className="skeleton-box skeleton-summary-line skeleton-shimmer" />
          <div className="skeleton-box skeleton-summary-line skeleton-shimmer" />
          <div className="skeleton-box skeleton-summary-line-short skeleton-shimmer" />
        </div>

        {/* Bottom action row */}
        <div className="skeleton-footer">
          <div className="skeleton-box skeleton-deadline skeleton-shimmer" />
          <div className="skeleton-actions">
            <div className="skeleton-box skeleton-btn skeleton-shimmer" />
            <div className="skeleton-box skeleton-icon-btn skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
