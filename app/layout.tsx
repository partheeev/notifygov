import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'NotifyGov — Government Notifications, One Place',
  description:
    'Real-time central government recruitment, exam dates, admit cards, and results aggregated and verified directly from UPSC, SSC, RRB, IBPS, and official gazettes.',
  keywords: [
    'NotifyGov',
    'Government Notifications',
    'Sarkari Result',
    'UPSC 2026',
    'SSC CGL',
    'RRB JE',
    'IBPS PO',
    'Admit Cards',
    'Govt Job Alerts',
    'India Government Jobs',
  ],
  authors: [{ name: 'NotifyGov Intelligence Team' }],
  creator: 'NotifyGov',
  publisher: 'NotifyGov',
  applicationName: 'NotifyGov',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://notifygov.in',
    title: 'NotifyGov — Government Notifications, One Place',
    description:
      'Verified government job alerts, exams, admit cards, and results in real time.',
    siteName: 'NotifyGov',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotifyGov — Government Notifications, One Place',
    description:
      'Verified government job alerts, exams, admit cards, and results in real time.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0d14',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="app-shell">
          <Header unreadCount={5} />

          <main id="main-content" className="main-content">
            {children}
          </main>

          <footer className="site-footer">
            <div className="app-container footer-container">
              <div className="footer-top">
                <div className="footer-brand-col">
                  <div className="footer-logo">
                    <div className="footer-logo-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0a0d14"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: '16px', height: '16px' }}
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                    <span className="footer-brand-text">
                      Notify<span style={{ color: '#f59e0b' }}>Gov</span>
                    </span>
                  </div>
                  <p className="footer-mission">
                    Democratizing access to verified official government opportunities for over 45,000+ Indian aspirants.
                  </p>
                  <div className="footer-live-badge">
                    <span className="dot-live" />
                    <span>Real-time scrapers active</span>
                  </div>
                </div>

                <div className="footer-links-grid">
                  <div className="footer-links-col">
                    <h4 className="footer-col-title">Primary Sources</h4>
                    <ul className="footer-links-list">
                      <li>
                        <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer">
                          UPSC Civil Services
                        </a>
                      </li>
                      <li>
                        <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer">
                          Staff Selection Commission
                        </a>
                      </li>
                      <li>
                        <a href="https://indianrailways.gov.in" target="_blank" rel="noopener noreferrer">
                          Railway Recruitment Boards
                        </a>
                      </li>
                      <li>
                        <a href="https://ibps.in" target="_blank" rel="noopener noreferrer">
                          IBPS Banking Portal
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="footer-links-col">
                    <h4 className="footer-col-title">Categories</h4>
                    <ul className="footer-links-list">
                      <li><a href="#feed">Latest Examinations</a></li>
                      <li><a href="#feed">Recruitment Drives</a></li>
                      <li><a href="#feed">Admit Cards & Hall Tickets</a></li>
                      <li><a href="#feed">Final Results & Cutoffs</a></li>
                    </ul>
                  </div>

                  <div className="footer-links-col">
                    <h4 className="footer-col-title">Intelligence & Trust</h4>
                    <ul className="footer-links-list">
                      <li><a href="#sources">Source Verification Policy</a></li>
                      <li><a href="#sources">Zero-Spam Promise</a></li>
                      <li><a href="#alerts">Telegram Instant Feed</a></li>
                      <li><a href="#alerts">WhatsApp Alerts (Free)</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="footer-disclaimer-box">
                <p>
                  <strong>Disclaimer:</strong> NotifyGov is an independent public data notifications intelligence portal. We extract, summarize, and categorize official circulars published by Union & State Public Service Commissions and government ministries. We do not collect examination fees or represent any recruitment board directly. Candidates must verify all criteria on the official primary portal.
                </p>
              </div>

              <div className="footer-bottom">
                <p className="copyright-text">
                  &copy; 2026 NotifyGov. Built for India with speed &amp; precision.
                </p>
                <div className="footer-bottom-links">
                  <span>Privacy Policy</span>
                  <span className="separator">&bull;</span>
                  <span>Terms of Service</span>
                  <span className="separator">&bull;</span>
                  <span>API Status</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
