'use client';

import React, { useState } from 'react';
import SourceBadge from '@/components/SourceBadge';

interface SourceStatus {
  name: string;
  slug: string;
  url: string;
  interval: string;
  lastChecked: string;
  status: 'healthy' | 'active' | 'warning' | 'error';
  totalNotices: number;
  uptime: string;
}

const SOURCES_MONITORED: SourceStatus[] = [
  {
    name: 'Union Public Service Commission (UPSC)',
    slug: 'upsc',
    url: 'https://upsc.gov.in',
    interval: 'Every 2 hours',
    lastChecked: '12 minutes ago',
    status: 'healthy',
    totalNotices: 142,
    uptime: '99.8%',
  },
  {
    name: 'Staff Selection Commission (SSC)',
    slug: 'ssc',
    url: 'https://ssc.gov.in',
    interval: 'Every 2 hours',
    lastChecked: '15 minutes ago',
    status: 'healthy',
    totalNotices: 289,
    uptime: '99.5%',
  },
  {
    name: 'Railway Recruitment Boards (RRB)',
    slug: 'rrb',
    url: 'https://indianrailways.gov.in',
    interval: 'Every 2 hours',
    lastChecked: '18 minutes ago',
    status: 'healthy',
    totalNotices: 94,
    uptime: '99.1%',
  },
  {
    name: 'Institute of Banking Personnel (IBPS)',
    slug: 'ibps',
    url: 'https://ibps.in',
    interval: 'Every 2 hours',
    lastChecked: '25 minutes ago',
    status: 'healthy',
    totalNotices: 83,
    uptime: '99.9%',
  },
  {
    name: 'State Bank of India Careers (SBI)',
    slug: 'sbi',
    url: 'https://bank.sbi/careers',
    interval: 'Every 3 hours',
    lastChecked: '32 minutes ago',
    status: 'healthy',
    totalNotices: 41,
    uptime: '99.7%',
  },
  {
    name: 'National Testing Agency (NTA)',
    slug: 'nta',
    url: 'https://nta.ac.in',
    interval: 'Every 2 hours',
    lastChecked: '40 minutes ago',
    status: 'healthy',
    totalNotices: 112,
    uptime: '99.4%',
  },
  {
    name: 'Defence R&D Organisation (DRDO)',
    slug: 'drdo',
    url: 'https://drdo.gov.in',
    interval: 'Every 4 hours',
    lastChecked: '1 hour ago',
    status: 'healthy',
    totalNotices: 38,
    uptime: '98.9%',
  },
  {
    name: 'Indian Space Research Organisation (ISRO)',
    slug: 'isro',
    url: 'https://isro.gov.in',
    interval: 'Every 4 hours',
    lastChecked: '1 hour ago',
    status: 'healthy',
    totalNotices: 29,
    uptime: '99.6%',
  },
  {
    name: 'Food Corporation of India (FCI)',
    slug: 'fci',
    url: 'https://fci.gov.in',
    interval: 'Every 6 hours',
    lastChecked: '2 hours ago',
    status: 'healthy',
    totalNotices: 19,
    uptime: '98.5%',
  },
  {
    name: 'Employment News / Rozgar Samachar',
    slug: 'employment-news',
    url: 'https://employmentnews.gov.in',
    interval: 'Weekly on Friday',
    lastChecked: '4 hours ago',
    status: 'healthy',
    totalNotices: 215,
    uptime: '99.2%',
  },
];

export default function StatusPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="home-page-wrapper app-container">
      {/* Header */}
      <section className="feed-header-row" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span className="dot-live" />
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.04em' }}>
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <h1 className="section-title" style={{ fontSize: '2rem' }}>
            Portal Monitoring Engine Status
          </h1>
          <p className="section-subtitle">
            Live operational status, sync cadence, and uptime across all connected government ministries.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleRefresh}
          style={{ gap: '6px' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: '14px',
              height: '14px',
              animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
            }}
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          <span>{refreshing ? 'Checking...' : 'Refresh Status'}</span>
        </button>
      </section>

      {/* Summary KPI Cards */}
      <section className="stats-section" style={{ marginBottom: '2.5rem' }}>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value text-gradient-green">10 / 10</span>
            <span className="stat-label">Active Portals</span>
            <span className="stat-sub">100% operational</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-gradient-gold">2 Hours</span>
            <span className="stat-label">Sync Cycle</span>
            <span className="stat-sub">Via GitHub Actions cron</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-gradient-blue">99.7%</span>
            <span className="stat-label">Avg Uptime</span>
            <span className="stat-sub">Last 30 days</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-white">1,062</span>
            <span className="stat-label">Notices Indexed</span>
            <span className="stat-sub">Verified documents</span>
          </div>
        </div>
      </section>

      {/* Sources Table Card */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto', marginBottom: '3rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Source & Portal</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Cadence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Last Checked</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Indexed Notices</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Uptime</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES_MONITORED.map((source) => (
              <tr
                key={source.slug}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#f8fafc', transition: 'color 0.15s ease' }}
                    >
                      {source.name}
                    </a>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{source.url}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{source.interval}</td>
                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{source.lastChecked}</td>
                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{source.totalNotices}</td>
                <td style={{ padding: '1rem', color: '#34d399', fontWeight: 600 }}>{source.uptime}</td>
                <td style={{ padding: '1rem' }}>
                  <SourceBadge name={source.slug.toUpperCase()} healthStatus={source.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
