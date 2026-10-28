'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export type AlertType = 'eligible' | 'target' | 'admit_card' | 'result' | 'corrigendum';

interface AlertItem {
  id: string;
  title: string;
  organisation: string;
  type: AlertType;
  timestamp: string;
  matchReason?: string;
  summary: string;
  url: string;
  isRead: boolean;
  daysLeft?: number;
}

const SAMPLE_ALERTS: AlertItem[] = [
  // 100% Eligible Exams / Jobs
  {
    id: 'alert-1',
    title: 'UPSC Civil Services Examination 2026 — 979 Vacancies Released',
    organisation: 'UPSC',
    type: 'eligible',
    timestamp: '3 hours ago',
    matchReason: 'Matched: Any Degree / Graduation • Age 21-32 yrs',
    summary: 'Union Public Service Commission has officially notified the CSE 2026. Preliminary exam date, syllabus, and vacancies confirmed.',
    url: 'https://upsc.gov.in',
    isRead: false,
    daysLeft: 42,
  },
  {
    id: 'alert-2',
    title: 'SSC CGL 2026 — 17,727 Group B & C Posts Announced',
    organisation: 'SSC',
    type: 'eligible',
    timestamp: '5 hours ago',
    matchReason: 'Matched: Bachelor’s Degree • Age relaxation applied',
    summary: 'Staff Selection Commission announces Combined Graduate Level recruitment across Central Ministries, CBIC, and CAG.',
    url: 'https://ssc.gov.in',
    isRead: false,
    daysLeft: 22,
  },
  {
    id: 'alert-3',
    title: 'RRB Junior Engineer 2026 — 7,951 Technical Vacancies',
    organisation: 'RRB',
    type: 'eligible',
    timestamp: '1 day ago',
    matchReason: 'Matched: Engineering Degree / Diploma',
    summary: 'Centralized Employment Notice (CEN) for Junior Engineers in Civil, Mechanical, and Electrical divisions across Indian Railways.',
    url: 'https://indianrailways.gov.in',
    isRead: false,
    daysLeft: 5,
  },
  {
    id: 'alert-4',
    title: 'IBPS PO / MT 2026 — 4,455 Probationary Officer Vacancies',
    organisation: 'IBPS',
    type: 'eligible',
    timestamp: '2 days ago',
    matchReason: 'Matched: Graduation in any discipline',
    summary: 'Recruitment for Probationary Officers in 11 participating public sector banks including PNB, Bank of Baroda, and Canara Bank.',
    url: 'https://ibps.in',
    isRead: true,
    daysLeft: 28,
  },

  // Admit Cards & Exam Dates
  {
    id: 'alert-5',
    title: 'NTA UGC NET December 2025 — Admit Card & City Slip Released',
    organisation: 'NTA',
    type: 'admit_card',
    timestamp: '4 hours ago',
    matchReason: 'Your Target Exam: UGC NET / Teaching',
    summary: 'National Testing Agency has activated the download link for exam city intimation and official hall tickets. Check shift timing and exam center.',
    url: 'https://nta.ac.in',
    isRead: false,
  },
  {
    id: 'alert-6',
    title: 'SSC CHSL 2025 Tier-II Hall Ticket Active for Download',
    organisation: 'SSC',
    type: 'admit_card',
    timestamp: '1 day ago',
    matchReason: 'Your Target Exam: SSC CHSL',
    summary: 'Candidates shortlisted for Tier-II descriptive and typing tests can download their admit card using Roll Number and Date of Birth.',
    url: 'https://ssc.gov.in',
    isRead: true,
  },

  // Results & Cutoffs
  {
    id: 'alert-7',
    title: 'SSC CGL 2025 Tier-I Final Result & Cutoff Marks Declared',
    organisation: 'SSC',
    type: 'result',
    timestamp: '6 hours ago',
    matchReason: 'Your Target Exam: SSC CGL',
    summary: 'Category-wise cutoff marks published. 1,42,000 candidates qualified for Tier-II examination. Scorecards available until end of month.',
    url: 'https://ssc.gov.in',
    isRead: false,
  },
  {
    id: 'alert-8',
    title: 'IBPS Clerk 2025 Provisional Allotment & Reserve List Out',
    organisation: 'IBPS',
    type: 'result',
    timestamp: '2 days ago',
    matchReason: 'Your Target Exam: Banking Exams',
    summary: 'State-wise provisional allotment list published under the reserve list for Customer Service Associates.',
    url: 'https://ibps.in',
    isRead: true,
  },

  // Deadlines & Corrigenda
  {
    id: 'alert-9',
    title: 'URGENT: RRB Junior Engineer Window Closes in 5 Days!',
    organisation: 'RRB',
    type: 'corrigendum',
    timestamp: '2 hours ago',
    matchReason: 'Action Required: High server rush expected',
    summary: 'Last date for online registration and payment fee is fast approaching. Submit documents early to avoid payment gateway congestion.',
    url: 'https://indianrailways.gov.in',
    isRead: false,
    daysLeft: 5,
  },
  {
    id: 'alert-10',
    title: 'Corrigendum: UPSC CSE 2026 Examination Centers Revised',
    organisation: 'UPSC',
    type: 'corrigendum',
    timestamp: '18 hours ago',
    matchReason: 'Revision to your target exam',
    summary: 'Commission has added 4 new examination sub-centers in Maharashtra and Karnataka for Preliminary test centers selection.',
    url: 'https://upsc.gov.in',
    isRead: false,
  },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<AlertItem[]>(SAMPLE_ALERTS);
  const [activeTab, setActiveTab] = useState<string>('eligible');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  // Load candidate profile from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notifygov_user_profile');
      if (stored) {
        try {
          setCandidateProfile(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  // Filter items based on active tab and unread toggle
  const filteredItems = items.filter((item) => {
    if (showUnreadOnly && item.isRead) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'eligible') return item.type === 'eligible';
    if (activeTab === 'admit_card') return item.type === 'admit_card';
    if (activeTab === 'result') return item.type === 'result';
    if (activeTab === 'corrigendum') return item.type === 'corrigendum';

    return true;
  });

  const getTabCount = (type: string) => {
    if (type === 'all') return items.length;
    return items.filter((i) => i.type === type).length;
  };

  const unreadTotal = items.filter((i) => !i.isRead).length;

  const renderBadge = (type: AlertType) => {
    switch (type) {
      case 'eligible':
        return <span className="badge badge-green">100% ELIGIBLE</span>;
      case 'admit_card':
        return <span className="badge badge-purple">ADMIT CARD</span>;
      case 'result':
        return <span className="badge badge-blue">RESULT OUT</span>;
      case 'corrigendum':
        return <span className="badge badge-red">DEADLINE / CORRIGENDUM</span>;
      default:
        return null;
    }
  };

  return (
    <div className="home-page-wrapper app-container" style={{ maxWidth: '860px' }}>
      {/* Page Header */}
      <section className="feed-header-row" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
            <span className="badge badge-amber">CANDIDATE INTELLIGENCE INBOX</span>
            {unreadTotal > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                {unreadTotal} unread
              </span>
            )}
          </div>
          <h1 className="section-title" style={{ fontSize: '1.9rem' }}>
            Your Personalized Alerts
          </h1>
          <p className="section-subtitle">
            {candidateProfile ? (
              <>
                Customized for <strong>{candidateProfile.qualification}</strong> ({candidateProfile.discipline}) •{' '}
                <strong>Age {candidateProfile.age}</strong> ({candidateProfile.category})
              </>
            ) : (
              'Divided into eligible exams, hall tickets, results, and urgent updates matching your qualifications.'
            )}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={markAllRead}
            style={{ fontSize: '0.82rem' }}
          >
            Mark all read
          </button>
          <Link href="/onboarding" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            {candidateProfile ? 'Edit Profile' : 'Set Profile'}
          </Link>
        </div>
      </section>

      {/* Divided Navigation Tabs */}
      <div className="tabs-outer-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div className="tabs-scroll-row">
          <button
            type="button"
            className={`filter-tab ${activeTab === 'eligible' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('eligible')}
          >
            <span>⭐ Eligible Exams &amp; Jobs</span>
            <span className={`tab-count ${activeTab === 'eligible' ? 'is-active' : ''}`}>
              {getTabCount('eligible')}
            </span>
            {activeTab === 'eligible' && <span className="tab-indicator" />}
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'admit_card' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('admit_card')}
          >
            <span>🎟️ Admit Cards &amp; Dates</span>
            <span className={`tab-count ${activeTab === 'admit_card' ? 'is-active' : ''}`}>
              {getTabCount('admit_card')}
            </span>
            {activeTab === 'admit_card' && <span className="tab-indicator" />}
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'result' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            <span>🏆 Results &amp; Cutoffs</span>
            <span className={`tab-count ${activeTab === 'result' ? 'is-active' : ''}`}>
              {getTabCount('result')}
            </span>
            {activeTab === 'result' && <span className="tab-indicator" />}
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'corrigendum' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('corrigendum')}
          >
            <span>⚠️ Deadlines &amp; Corrigenda</span>
            <span className={`tab-count ${activeTab === 'corrigendum' ? 'is-active' : ''}`}>
              {getTabCount('corrigendum')}
            </span>
            {activeTab === 'corrigendum' && <span className="tab-indicator" />}
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All Alerts</span>
            <span className={`tab-count ${activeTab === 'all' ? 'is-active' : ''}`}>
              {getTabCount('all')}
            </span>
            {activeTab === 'all' && <span className="tab-indicator" />}
          </button>
        </div>
      </div>

      {/* Sub-toolbar: Unread toggle & count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#94a3b8',
        }}
      >
        <span>
          Showing <strong>{filteredItems.length}</strong> updates in this category
        </span>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <span>Show unread only</span>
        </label>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '3.5rem' }}>
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#94a3b8' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: '24px', height: '24px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
              No updates in this section
            </h3>
            <p style={{ fontSize: '0.86rem', margin: 0 }}>
              {showUnreadOnly
                ? 'You have read all alerts in this category.'
                : 'Our scraper engine continuously monitors official portals and will alert you the moment a circular appears.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.25rem 1.4rem',
                borderLeft: item.isRead
                  ? '3px solid rgba(255, 255, 255, 0.1)'
                  : item.type === 'corrigendum'
                  ? '3px solid #ef4444'
                  : item.type === 'eligible'
                  ? '3px solid #10b981'
                  : '3px solid #f59e0b',
                background: item.isRead ? 'rgba(17, 24, 39, 0.45)' : 'rgba(17, 24, 39, 0.85)',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {renderBadge(item.type)}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
                    {item.organisation}
                  </span>
                  {item.matchReason && (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#34d399',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 500,
                      }}
                    >
                      ✓ {item.matchReason}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => toggleRead(item.id)}
                    style={{
                      fontSize: '0.74rem',
                      color: item.isRead ? '#64748b' : '#fbbf24',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    title={item.isRead ? 'Mark unread' : 'Mark as read'}
                  >
                    {item.isRead ? 'Mark unread' : '● Mark read'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.02rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.45rem', lineHeight: 1.4 }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', transition: 'color 0.15s ease' }}
                >
                  {item.title}
                </a>
              </h3>

              {/* Summary */}
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.55, margin: 0, marginBottom: '0.85rem' }}>
                {item.summary}
              </p>

              {/* Bottom Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  {typeof item.daysLeft === 'number' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: item.daysLeft <= 7 ? '#f87171' : '#fbbf24',
                        background: item.daysLeft <= 7 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        border: `1px solid ${item.daysLeft <= 7 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      ⏱ {item.daysLeft} days left to apply
                    </span>
                  )}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', gap: '5px' }}
                >
                  <span>View Official Notification</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
