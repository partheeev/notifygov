'use client';

import React, { useState } from 'react';
import SourceBadge from './SourceBadge';
import DeadlineBadge from './DeadlineBadge';

export interface NotificationCardProps {
  id: string;
  title: string;
  organisation: string;
  category: 'exam' | 'recruitment' | 'result' | 'admit_card' | 'corrigendum' | string;
  summary: string;
  deadline?: string | null;
  officialUrl: string;
  applyUrl?: string | null;
  isNew?: boolean;
  daysLeft?: number | null;
}

export default function NotificationCard({
  id,
  title,
  organisation,
  category,
  summary,
  deadline,
  officialUrl,
  applyUrl,
  isNew = false,
  daysLeft,
}: NotificationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Category normalization & accent color mapping
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'exam':
        return {
          label: 'Exam',
          color: '#3b82f6',
          badgeClass: 'badge-blue',
        };
      case 'recruitment':
        return {
          label: 'Recruitment',
          color: '#f59e0b',
          badgeClass: 'badge-amber',
        };
      case 'result':
        return {
          label: 'Result',
          color: '#10b981',
          badgeClass: 'badge-green',
        };
      case 'admit_card':
        return {
          label: 'Admit Card',
          color: '#8b5cf6',
          badgeClass: 'badge-purple',
        };
      case 'corrigendum':
        return {
          label: 'Corrigendum',
          color: '#ef4444',
          badgeClass: 'badge-red',
        };
      default:
        return {
          label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
          color: '#3b82f6',
          badgeClass: 'badge-blue',
        };
    }
  };

  const catMeta = getCategoryDetails(normalizedCategory);

  const getActionLabel = (cat: string) => {
    switch (cat.toLowerCase().replace(/\s+/g, '_')) {
      case 'result':
        return 'Check Result';
      case 'admit_card':
        return 'Download Admit Card';
      case 'corrigendum':
        return 'Direct Portal';
      default:
        return 'Apply Online';
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - Official notification via NotifyGov`,
          url: officialUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${title} - ${officialUrl}`);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      } catch {
        // Clipboard error fallback
      }
    }
  };

  return (
    <article
      className="notification-card glass-card"
      style={{ '--category-accent': catMeta.color } as React.CSSProperties}
    >
      <div className="accent-bar" />

      <div className="card-inner">
        {/* Top Header Row */}
        <div className="card-header">
          <div className="header-left">
            <SourceBadge name={organisation} healthStatus="healthy" />
            {isNew && (
              <span className="new-badge">
                <span className="new-ping" />
                NEW
              </span>
            )}
          </div>

          <div className="header-right">
            <span className={`badge ${catMeta.badgeClass}`}>
              {catMeta.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="card-title line-clamp-2">
          <a
            href={applyUrl || officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="title-link"
            title={`Open ${applyUrl ? 'direct application portal' : 'official notification'}`}
          >
            {title}
          </a>
        </h3>

        {/* Summary Description */}
        <p className="card-summary line-clamp-3">
          {summary}
        </p>

        {/* Footer Meta & Actions */}
        <div className="card-footer">
          <div className="footer-meta">
            <DeadlineBadge deadline={deadline} daysLeft={daysLeft} />
          </div>

          <div className="footer-actions">
            {/* Share Button */}
            <button
              type="button"
              className="action-icon-btn"
              onClick={handleShare}
              title={hasCopied ? 'Link Copied!' : 'Share notification'}
              aria-label="Share notification"
            >
              {hasCopied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon-svg">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-svg">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              className={`action-icon-btn ${isSaved ? 'is-active' : ''}`}
              onClick={() => setIsSaved(!isSaved)}
              title={isSaved ? 'Remove Bookmark' : 'Save notification'}
              aria-label="Save notification"
            >
              <svg
                viewBox="0 0 24 24"
                fill={isSaved ? '#f59e0b' : 'none'}
                stroke={isSaved ? '#f59e0b' : 'currentColor'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon-svg"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {/* Direct Apply / Action Online Portal Link (Primary) */}
            {applyUrl ? (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                title={`Open verified direct ${getActionLabel(category).toLowerCase()} portal`}
                style={{ fontSize: '0.78rem', padding: '0.42rem 0.95rem', gap: '6px' }}
              >
                <span>{getActionLabel(category)}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: '12px', height: '12px' }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ) : null}

            {/* Official Notification Circular Link */}
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline view-link"
              title="View verified official government gazette circular"
            >
              <span>Official Notice</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="external-icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
