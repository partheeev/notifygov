'use client';

import React, { useState, useEffect } from 'react';

export interface HeaderProps {
  unreadCount?: number;
}

export default function Header({ unreadCount = 5 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-inner app-container">
          {/* Logo */}
          <div className="logo-group">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <a href="/" className="brand-logo" aria-label="NotifyGov Home">
              <div className="logo-icon-box">
                <svg
                  className="bell-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0d14"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              <div className="brand-text-container">
                <span className="brand-title">
                  Notify<span className="brand-accent">Gov</span>
                </span>
                <span className="brand-pill">GOV INTEL</span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <a href="/" className="nav-link is-active">
              <span>Feed</span>
              <span className="active-dot" />
            </a>
            <a href="/status" className="nav-link">
              <span>Sources</span>
              <span className="nav-count-pill">10 Active</span>
            </a>
            <a href="/notifications" className="nav-link">
              <span>Alerts</span>
              {unreadCount > 0 && (
                <span className="unread-counter-badge" title={`${unreadCount} new notifications`}>
                  {unreadCount}
                </span>
              )}
            </a>
          </nav>

          {/* Right Action CTA */}
          <div className="header-actions">
            {unreadCount > 0 && (
              <div className="mobile-unread-pill" title={`${unreadCount} unread`}>
                <svg className="bell-subtle" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>{unreadCount}</span>
              </div>
            )}

            {/* Sign in link */}
            <a href="/login" className="btn-ghost" style={{ fontSize: '0.84rem' }}>
              Sign In
            </a>

            <a href="/onboarding" className="btn-primary get-alerts-btn">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="btn-bell-icon"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Get Alerts</span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Nav Slide-in Drawer from Left */}
      <aside
        className={`mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="drawer-header">
          <div className="brand-logo">
            <div className="logo-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0a0d14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="bell-icon">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span className="brand-title">
              Notify<span className="brand-accent">Gov</span>
            </span>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          <nav className="mobile-nav-links">
            <a
              href="/"
              className="mobile-nav-item is-active"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-label">Notification Feed</span>
              <span className="mobile-badge-live">LIVE</span>
            </a>

            <a
              href="/status"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-label">Official Sources</span>
              <span className="mobile-badge-secondary">10 Verified</span>
            </a>

            <a
              href="/notifications"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-label">Instant Alerts</span>
              {unreadCount > 0 && (
                <span className="unread-counter-badge">{unreadCount}</span>
              )}
            </a>
            <a
              href="/login"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-label">Sign In / Account</span>
            </a>
          </nav>

          <div className="drawer-status-card">
            <div className="status-indicator-row">
              <span className="dot-live" />
              <span className="status-label">All Systems Operational</span>
            </div>
            <p className="status-meta">
              Continuous sync with UPSC, SSC, RRB, IBPS & Gazette portals.
            </p>
          </div>
        </div>

        <div className="drawer-footer">
          <a
            href="/onboarding"
            className="btn-primary mobile-cta-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-bell-icon">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Subscribe for Free Alerts</span>
          </a>
        </div>
      </aside>
    </>
  );
}
