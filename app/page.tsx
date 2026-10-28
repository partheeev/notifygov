'use client';

import React, { useState, useEffect } from 'react';
import FilterBar from '@/components/FilterBar';
import NotificationFeed from '@/components/NotificationFeed';
import SourceBadge from '@/components/SourceBadge';
import PushNotificationBanner from '@/components/PushNotificationBanner';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'UPSC Civil Services Examination 2026 — Notification Released',
    organisation: 'UPSC',
    category: 'exam',
    summary:
      'Union Public Service Commission has released the notification for Civil Services (Preliminary) Examination 2026. Total vacancies: 979. Eligibility: Graduation in any discipline. Age limit: 21-32 years (relaxation for reserved categories).',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://upsc.gov.in',
    isNew: true,
    daysLeft: 45,
  },
  {
    id: '2',
    title: 'SSC CGL 2026 Recruitment — 17,727 Vacancies Announced',
    organisation: 'SSC',
    category: 'recruitment',
    summary:
      'Staff Selection Commission announces Combined Graduate Level Examination 2026. Vacancies: 17,727 across Group B and C posts. Qualification: Any degree. Age: 18-32 years.',
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://ssc.gov.in',
    isNew: true,
    daysLeft: 22,
  },
  {
    id: '3',
    title: 'RRB JE 2026 — Junior Engineer Recruitment Open',
    organisation: 'RRB',
    category: 'recruitment',
    summary:
      'Railway Recruitment Boards invite applications for Junior Engineer posts across all departments. Qualification: Diploma/BE/BTech in relevant engineering discipline. Approx. 7,000+ vacancies.',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://indianrailways.gov.in',
    isNew: false,
    daysLeft: 6,
  },
  {
    id: '4',
    title: 'IBPS PO 2026 — Probationary Officer Notification',
    organisation: 'IBPS',
    category: 'recruitment',
    summary:
      'IBPS announces recruitment of Probationary Officers across 11 participating public sector banks. Vacancies: 4,455. Qualification: Graduation. Age: 20-30 years.',
    deadline: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://ibps.in',
    isNew: false,
    daysLeft: 31,
  },
  {
    id: '5',
    title: 'SSC CHSL 2025 — Result Declared',
    organisation: 'SSC',
    category: 'result',
    summary:
      'Combined Higher Secondary Level Examination 2025 results have been declared on the official SSC website. Candidates can check their results using Roll Number and Date of Birth.',
    deadline: null,
    officialUrl: 'https://ssc.gov.in',
    isNew: true,
    daysLeft: null,
  },
  {
    id: '6',
    title: 'NTA UGC NET December 2025 — Admit Card Released',
    organisation: 'NTA',
    category: 'admit_card',
    summary:
      'National Testing Agency has released admit cards for UGC NET December 2025 examination. Download from the official portal using Application Number and Date of Birth.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://nta.ac.in',
    isNew: true,
    daysLeft: 3,
  },
  {
    id: '7',
    title: 'ISRO Scientist/Engineer SC 2026 Recruitment',
    organisation: 'ISRO',
    category: 'recruitment',
    summary:
      'Indian Space Research Organisation invites applications for Scientist/Engineer SC posts. Qualification: First class BE/BTech in relevant discipline. 200 vacancies across multiple departments.',
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://isro.gov.in',
    isNew: false,
    daysLeft: 18,
  },
  {
    id: '8',
    title: 'FCI Assistant Grade III 2026 — 5,000 Vacancies',
    organisation: 'FCI',
    category: 'recruitment',
    summary:
      'Food Corporation of India announces recruitment for Assistant Grade III (General/Accounts/Technical/Depot) posts. Qualification: Graduation/BSc Agriculture/BTech. State-wise openings available.',
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://fci.gov.in',
    isNew: false,
    daysLeft: 55,
  },
  {
    id: '9',
    title: 'DRDO CEPTAM 10 — Multi Tasking Staff Recruitment',
    organisation: 'DRDO',
    category: 'recruitment',
    summary:
      'Defence R&D Organisation Centre for Personnel Talent Management announces recruitment for MTS posts. Qualification: 10th pass with ITI/Matriculation. 1,901 vacancies.',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://drdo.gov.in',
    isNew: false,
    daysLeft: 12,
  },
  {
    id: '10',
    title: 'SBI PO 2026 — Probationary Officer Recruitment Notification',
    organisation: 'SBI',
    category: 'recruitment',
    summary:
      'State Bank of India announces 600 vacancies for Probationary Officer posts. Qualification: Graduation in any discipline from a recognised University. Age: 21-30 years.',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    officialUrl: 'https://bank.sbi',
    isNew: false,
    daysLeft: 28,
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Animated counter states
  const [sourcesCount, setSourcesCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [aspirantsCount, setAspirantsCount] = useState(0);

  // Simulate initial demo loading skeleton for 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animated counters on mount
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      setSourcesCount(Math.floor(easeOut * 10));
      setHoursCount(Math.floor(easeOut * 2));
      setAspirantsCount(Math.floor(easeOut * 45000));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animReq = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animReq);
  }, []);

  // Compute category counts for tab badges
  const categoryCounts = MOCK_NOTIFICATIONS.reduce<Record<string, number>>(
    (acc, item) => {
      acc.all = (acc.all || 0) + 1;
      const cat = item.category.toLowerCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    { all: MOCK_NOTIFICATIONS.length }
  );

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(MOCK_NOTIFICATIONS.length);
      setIsLoadingMore(false);
    }, 400);
  };

  // Slice notifications according to pagination
  const displayedNotifications = MOCK_NOTIFICATIONS.slice(0, visibleCount);

  return (
    <div className="home-page-wrapper">
      {/* Radial Glow Layer in Background */}
      <div className="hero-glow-layer" />

      {/* Hero Section */}
      <section className="hero-section app-container">
        <div className="hero-badge-pill">
          <span className="dot-live" />
          <span className="hero-badge-text">Direct Central Gazette & Portal Stream</span>
        </div>

        <h1 className="hero-headline">
          Never Miss a <span className="text-gradient-gold">Government</span> Notification
        </h1>

        <p className="hero-subtext">
          Zero noise, verified public recruitment intelligence. Instant updates for UPSC, SSC, Railways, Banking, Defence, and PSU examinations direct from official Union gazettes.
        </p>

        {/* Live Monitored Sources Banner */}
        <div className="sources-preview-row">
          <span className="sources-preview-label">Live Feeds:</span>
          <div className="sources-tags-scroll">
            <SourceBadge name="UPSC" healthStatus="healthy" />
            <SourceBadge name="SSC" healthStatus="healthy" />
            <SourceBadge name="RRB" healthStatus="healthy" />
            <SourceBadge name="IBPS" healthStatus="healthy" />
            <SourceBadge name="NTA" healthStatus="healthy" />
            <SourceBadge name="ISRO" healthStatus="healthy" />
            <SourceBadge name="DRDO" healthStatus="healthy" />
            <SourceBadge name="SBI" healthStatus="healthy" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section app-container">
        <div className="stats-grid glass-card">
          <div className="stat-card">
            <div className="stat-value text-gradient-gold">
              {sourcesCount}
            </div>
            <div className="stat-label">Sources Monitored</div>
            <div className="stat-sub">Central portals & gazettes</div>
          </div>

          <div className="stat-card">
            <div className="stat-value text-gradient-blue">
              {hoursCount > 0 ? `Every ${hoursCount} Hours` : 'Continuous'}
            </div>
            <div className="stat-label">Sync Cycle</div>
            <div className="stat-sub">Automated verification bot</div>
          </div>

          <div className="stat-card">
            <div className="stat-value text-gradient-green">
              {aspirantsCount > 0 ? `${(aspirantsCount / 1000).toFixed(0)}k+` : '45k+'}
            </div>
            <div className="stat-label">Active Aspirants</div>
            <div className="stat-sub">Across 28 Indian States</div>
          </div>

          <div className="stat-card">
            <div className="stat-value text-white">
              100% Free
            </div>
            <div className="stat-label">Public Service</div>
            <div className="stat-sub">No paywalls, zero ads</div>
          </div>
        </div>
      </section>

      {/* Main Notification Feed Section */}
      <section id="feed" className="feed-section app-container">
        <div className="feed-header-row">
          <div>
            <h2 className="section-title">Official Notification Stream</h2>
            <p className="section-subtitle">
              Verified announcements published in the last 72 hours
            </p>
          </div>
          <div className="verified-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="verified-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>Cryptographically Verified Links</span>
          </div>
        </div>

        {/* Push Notification Opt-in */}
        <PushNotificationBanner />

        {/* Interactive Filter & Search Bar */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={categoryCounts}
        />

        {/* Notification Feed */}
        <NotificationFeed
          notifications={displayedNotifications}
          isLoading={isLoading}
          filter={activeFilter}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />

        {/* Load More Button */}
        {!isLoading && visibleCount < MOCK_NOTIFICATIONS.length && !searchQuery && activeFilter === 'all' && (
          <div className="load-more-container">
            <button
              type="button"
              className="btn-secondary load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <span className="spinner-dot" />
                  <span>Loading official feed...</span>
                </>
              ) : (
                <>
                  <span>Load More Notifications</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
