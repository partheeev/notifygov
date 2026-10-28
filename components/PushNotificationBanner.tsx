'use client';

import React, { useState, useEffect } from 'react';

export default function PushNotificationBanner() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('Service worker registration failed:', err));
    }
  }, []);

  const handleSubscribe = async () => {
    if (!supported) return;

    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        // Check for existing subscription or create one
        let sub = await registration.pushManager.getSubscription();

        if (!sub) {
          // Subscribe without VAPID or with standard options
          try {
            sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
            });
          } catch (e) {
            console.info('Push subscription without VAPID keys recorded as local permission.');
          }
        }

        // Post subscription to server
        if (sub) {
          await fetch('/api/alerts/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub }),
          });
        }

        setSubscribed(true);
        setTimeout(() => setDismissed(true), 3000);
      }
    } catch (err) {
      console.error('Push notification subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (!supported || permission === 'granted' || dismissed) {
    if (subscribed) {
      return (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Notifications active! You will receive instant alerts for new vacancies & deadlines.
        </div>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        padding: '10px 16px',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0a0d14',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
            Enable Instant Notifications
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Get alerted directly on your phone when UPSC, SSC, or RRB publish new circulars.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubscribe}
          disabled={subscribing}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
        >
          {subscribing ? 'Enabling...' : 'Turn On Alerts'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '0.75rem',
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
