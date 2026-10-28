'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    officialUrl: 'https://upsc.gov.in/examinations/active-examinations',
    applyUrl: 'https://upsconline.nic.in',
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
    officialUrl: 'https://ssc.gov.in/notices',
    applyUrl: 'https://ssc.gov.in/login',
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
    officialUrl: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,4,1244',
    applyUrl: 'https://www.rrbapply.gov.in',
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
    officialUrl: 'https://www.ibps.in/index.php/crp-po-mt-xiv/',
    applyUrl: 'https://ibpsonline.ibps.in',
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
    officialUrl: 'https://ssc.gov.in/notices',
    applyUrl: 'https://ssc.gov.in/results',
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
    officialUrl: 'https://ugcnet.nta.ac.in',
    applyUrl: 'https://ugcnet.ntaonline.in',
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
    officialUrl: 'https://www.isro.gov.in/CurrentOpportunities.html',
    applyUrl: 'https://www.isro.gov.in/CurrentOpportunities.html',
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
    officialUrl: 'https://fci.gov.in/recruitment.php',
    applyUrl: 'https://fci.gov.in/recruitment.php',
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
    officialUrl: 'https://www.drdo.gov.in/careers',
    applyUrl: 'https://rac.gov.in',
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
    officialUrl: 'https://bank.sbi/web/careers/current-openings',
    applyUrl: 'https://bank.sbi/web/careers/current-openings',
    isNew: false,
    daysLeft: 28,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Quick Eligibility Matcher states on front page
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [quickQual, setQuickQual] = useState('Graduation (Any Discipline)');
  const [quickAge, setQuickAge] = useState(24);
  const [quickCat, setQuickCat] = useState('General');

  // Animated counter states
  const [sourcesCount, setSourcesCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [aspirantsCount, setAspirantsCount] = useState(0);

  // Check saved profile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('notifygov_user_profile');
      if (p) {
        try {
          setSavedProfile(JSON.parse(p));
        } catch {}
      }
    }
  }, []);

  const handleQuickMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      qualification: quickQual,
      discipline: 'General / All Disciplines',
      age: quickAge,
      category: quickCat,
      state: 'All India',
      targetExams: ['UPSC Civil Services', 'SSC CGL', 'RRB Junior Engineer'],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifygov_user_profile', JSON.stringify(profile));
    }
    router.push('/notifications');
  };

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

        {/* Front-and-Center Quick Candidate Profile & Matcher */}
        {savedProfile ? (
          <div
            className="glass-card"
            style={{
              maxWidth: '820px',
              width: '100%',
              padding: '1.25rem 1.5rem',
              background: 'rgba(16, 185, 129, 0.09)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              marginBottom: '1.75rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="dot-live" />
                <div>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                    Active Profile: {savedProfile.qualification}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Age {savedProfile.age} • {savedProfile.category} category • 6 matching jobs found
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/notifications" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1.15rem' }}>
                  View 6 Eligible Matches &rarr;
                </Link>
                <Link href="/onboarding" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}>
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleQuickMatch}
            className="glass-card"
            style={{
              maxWidth: '840px',
              width: '100%',
              padding: '1.6rem 1.8rem',
              background: 'rgba(17, 24, 39, 0.88)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '18px',
              marginBottom: '1.75rem',
              textAlign: 'left',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.74rem' }}>⭐ SET PROFILE ON FRONT PAGE</span>
                <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>Takes 10 seconds</span>
              </div>
              <Link href="/onboarding" style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'underline' }}>
                Advanced 3-step profile &rarr;
              </Link>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
              Find Central Government Jobs You Are Eligible For
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Select your degree and age below to filter 100+ notifications and view only what you qualify for:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                  YOUR QUALIFICATION
                </label>
                <select
                  value={quickQual}
                  onChange={(e) => setQuickQual(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(10, 13, 20, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option>Graduation (Any Discipline)</option>
                  <option>B.E. / B.Tech (Engineering)</option>
                  <option>Diploma in Engineering</option>
                  <option>12th Standard / Higher Secondary</option>
                  <option>10th Standard / Matriculation</option>
                  <option>Post Graduation (Master’s)</option>
                  <option>Law (LLB)</option>
                  <option>Medical / MBBS</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                  YOUR CURRENT AGE: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{quickAge} yrs</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="45"
                  value={quickAge}
                  onChange={(e) => setQuickAge(parseInt(e.target.value) || 18)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(10, 13, 20, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' }}>
                  CATEGORY (FOR RELAXATION)
                </label>
                <select
                  value={quickCat}
                  onChange={(e) => setQuickCat(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(10, 13, 20, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>EWS</option>
                  <option>PwBD</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.96rem',
                fontWeight: 700,
                gap: '8px',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
              }}
            >
              <span>⭐ Find Jobs Eligible For Me (6 Found)</span>
              <span style={{ fontSize: '1.15rem' }}>&rarr;</span>
            </button>
          </form>
        )}

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
