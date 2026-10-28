'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) throw error;
      } else {
        // Mock fallback if Supabase keys not added yet
        window.location.href = '/onboarding';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) throw error;
      }
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-wrapper app-container" style={{ maxWidth: '480px', paddingTop: '3.5rem' }}>
      <div className="glass-card" style={{ padding: '2.25rem 2rem' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0d14"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '22px', height: '22px' }}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Welcome to Notify<span style={{ color: '#f59e0b' }}>Gov</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Sign in to get personalized government job notifications matching your degree &amp; age.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#10b981',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Check your email
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              We sent a 1-click magic sign-in link to <strong>{email}</strong>. Tap the link to log in.
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSent(false)}
              style={{ fontSize: '0.82rem' }}
            >
              Try another email
            </button>
          </div>
        ) : (
          <>
            {/* 1-Tap Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#f8fafc',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: '1.25rem',
              }}
            >
              {/* Google G Logo SVG */}
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.25rem 0',
                color: '#64748b',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="email-input"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.45rem' }}
                >
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 0.95rem',
                    borderRadius: '10px',
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem' }}
              >
                {loading ? 'Sending link...' : 'Send Magic Sign-In Link'}
              </button>
            </form>
          </>
        )}

        {/* Security & trust footer note */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            No password required. By continuing, you agree to NotifyGov&apos;s Terms of Service and Privacy Policy. 100% free public service.
          </p>
        </div>
      </div>
    </div>
  );
}
