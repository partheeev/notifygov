'use client';

import React from 'react';
import NotificationCard, { NotificationCardProps } from './NotificationCard';
import SkeletonCard from './SkeletonCard';

export interface NotificationFeedProps {
  notifications: NotificationCardProps[];
  isLoading: boolean;
  filter: string;
  searchQuery: string;
  onResetFilters?: () => void;
}

export default function NotificationFeed({
  notifications,
  isLoading,
  filter,
  searchQuery,
  onResetFilters,
}: NotificationFeedProps) {
  // If loading, show 6 SkeletonCards
  if (isLoading) {
    return (
      <div className="feed-grid" aria-busy="true" aria-label="Loading notifications">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Filter logic
  const filteredNotifications = notifications.filter((item) => {
    // Category filter check
    const matchesCategory =
      !filter ||
      filter.toLowerCase() === 'all' ||
      item.category.toLowerCase() === filter.toLowerCase() ||
      item.category.toLowerCase().replace(/_/g, '') === filter.toLowerCase().replace(/_/g, '');

    // Search query check (title, organisation, summary)
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.organisation.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Empty state if no results match
  if (filteredNotifications.length === 0) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-icon-wrapper">
          <svg
            className="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path d="M10 7v3" />
            <path d="M10 13h.01" />
          </svg>
        </div>

        <h3 className="empty-title">No notifications match your filters</h3>
        <p className="empty-desc">
          Try clearing your search query or switching to another category tab.
        </p>

        {onResetFilters && (
          <button
            type="button"
            className="btn-primary reset-btn"
            onClick={onResetFilters}
          >
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="feed-grid" aria-label="Official notifications list">
      {filteredNotifications.map((notification) => (
        <NotificationCard key={notification.id} {...notification} />
      ))}
    </div>
  );
}
