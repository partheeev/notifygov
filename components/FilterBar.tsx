'use client';

import React, { useRef } from 'react';

export type FilterCategory = 'all' | 'exam' | 'recruitment' | 'result' | 'admit_card' | 'corrigendum';

export interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts?: Record<string, number>;
}

interface FilterTab {
  id: string;
  label: string;
  icon?: string;
}

const TABS: FilterTab[] = [
  { id: 'all', label: 'All' },
  { id: 'exam', label: 'Exams' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'result', label: 'Results' },
  { id: 'admit_card', label: 'Admit Cards' },
  { id: 'corrigendum', label: 'Corrigenda' },
];

export default function FilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}: FilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    onFilterChange(tabId);
  };

  return (
    <div className="filter-bar-container">
      {/* Search Input Bar */}
      <div className="search-wrapper">
        <div className="search-input-box">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search notifications by keyword, organisation (e.g. UPSC, SSC), or post..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="notification-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="tabs-outer-wrapper">
        <div className="tabs-scroll-row" ref={scrollContainerRef}>
          {TABS.map((tab) => {
            const isActive = activeFilter.toLowerCase() === tab.id.toLowerCase();
            const count = counts?.[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                className={`filter-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span className={`tab-count ${isActive ? 'is-active' : ''}`}>
                    {count}
                  </span>
                )}
                {isActive && <span className="tab-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
