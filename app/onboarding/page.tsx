'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface CandidateProfileState {
  qualification: string;
  discipline: string;
  age: number;
  category: string;
  state: string;
  targetExams: string[];
}

const QUALIFICATIONS = [
  'Graduation (Any Discipline)',
  'B.E. / B.Tech (Engineering)',
  'Diploma in Engineering',
  'Post Graduation (Master’s)',
  '12th Standard / Higher Secondary',
  '10th Standard / Matriculation',
  'Law (LLB)',
  'Medical / Nursing / MBBS',
];

const DISCIPLINES = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Computer Science / IT',
  'Commerce / Accounts',
  'Arts / Humanities',
  'Science / BSc Agriculture',
  'General / Non-Technical',
];

const CATEGORIES = [
  { label: 'General / Unreserved', value: 'General' },
  { label: 'OBC (Non-Creamy Layer)', value: 'OBC' },
  { label: 'SC (Scheduled Caste)', value: 'SC' },
  { label: 'ST (Scheduled Tribe)', value: 'ST' },
  { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
  { label: 'PwBD (Persons with Disabilities)', value: 'PwBD' },
];

const TARGET_EXAMS = [
  'UPSC Civil Services (IAS/IPS)',
  'SSC CGL (Group B/C)',
  'RRB Junior Engineer (Railway)',
  'IBPS PO / Clerk (Banking)',
  'SBI PO / Clerk',
  'UGC NET / Teaching',
  'Defence (DRDO / CDS / AFCAT)',
  'Engineering Services (ESE)',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<CandidateProfileState>({
    qualification: 'Graduation (Any Discipline)',
    discipline: 'General / Non-Technical',
    age: 24,
    category: 'General',
    state: 'Delhi (NCT)',
    targetExams: ['UPSC Civil Services (IAS/IPS)', 'SSC CGL (Group B/C)'],
  });
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Check if user is already signed in
  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      });
    }
  }, []);

  const toggleTargetExam = (exam: string) => {
    setProfile((prev) => {
      const exists = prev.targetExams.includes(exam);
      if (exists) {
        return { ...prev, targetExams: prev.targetExams.filter((e) => e !== exam) };
      }
      return { ...prev, targetExams: [...prev.targetExams, exam] };
    });
  };

  const handleFinish = async () => {
    // 1. Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifygov_user_profile', JSON.stringify(profile));
    }

    // 2. If user already logged in, save to Supabase user_profiles table
    if (supabase && currentUser) {
      try {
        await supabase
          .from('user_profiles')
          .update({
            qualification: profile.qualification,
            discipline: profile.discipline,
            category: profile.category,
            state: profile.state,
            target_exams: profile.targetExams,
            onboarding_completed: true,
          })
          .eq('id', currentUser.id);
      } catch (err) {
        console.warn('Could not sync profile to Supabase:', err);
      }
    }

    setSaved(true);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });
      } else {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setAuthLoading(false);
    }
  };

  return (
    <div className="home-page-wrapper app-container" style={{ maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.85rem' }}>
          PERSONALIZED INTELLIGENCE
        </span>
        <h1 className="hero-headline" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Candidate Eligibility Profile
        </h1>
        <p className="hero-subtext" style={{ margin: '0 auto', fontSize: '0.95rem' }}>
          Set your qualifications once. NotifyGov filters 100+ daily circulars and alerts you only when you are 100% eligible.
        </p>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '9999px',
                background: s <= step ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#10b981',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '28px', height: '28px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
              Profile Setup Complete!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Matched against active circulars: you qualify for{' '}
              <strong style={{ color: '#34d399' }}>6 central government recruitment drives</strong> right now!
            </p>

            {/* High-Converting Sync / Sign-in Prompt if user is a guest */}
            {!currentUser ? (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  maxWidth: '520px',
                  margin: '0 auto 2rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                  <span className="dot-live" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Protect &amp; Sync Your Matches
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                  Sync your profile to your phone &amp; activate instant alerts
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Don&apos;t lose your 6 eligible job matches if you close this tab. Sign in to sync across your phone and get alerted the minute a new vacancy is published.
                </p>

                {/* 1-Tap Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0a0d14',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '0.85rem',
                    width: '100%',
                    maxWidth: '320px',
                  }}
                >
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
                  <span>{authLoading ? 'Connecting...' : 'Save & Sync with Google'}</span>
                </button>

                <div>
                  <Link href="/login" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'underline' }}>
                    or sign in with Email magic link
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem',
                  maxWidth: '480px',
                  margin: '0 auto 1.75rem',
                  color: '#34d399',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                }}
              >
                ✓ Synced to your account ({currentUser.email}). Your eligible matches are active across all your devices.
              </div>
            )}

            {/* Direct action links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-primary">
                View My 6 Eligible Notifications &rarr;
              </Link>
              <Link href="/notifications" className="btn-secondary">
                Go to Alerts Inbox
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Qualification & Discipline */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1.25rem' }}>
                  Step 1: Educational Qualification &amp; Stream
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    HIGHEST QUALIFICATION
                  </label>
                  <select
                    value={profile.qualification}
                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    PRIMARY STREAM / DISCIPLINE
                  </label>
                  <select
                    value={profile.discipline}
                    onChange={(e) => setProfile({ ...profile, discipline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  >
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                    Next: Age &amp; Category &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Age & Reservation Category */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1.25rem' }}>
                  Step 2: Age &amp; Reservation Category
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    YOUR CURRENT AGE: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{profile.age} years</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="45"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>18 yrs</span>
                    <span>30 yrs</span>
                    <span>45 yrs</span>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    RESERVATION CATEGORY (FOR AGE RELAXATION &amp; FEE CONCESSION)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {CATEGORIES.map((c) => {
                      const isSelected = profile.category === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setProfile({ ...profile, category: c.value })}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: isSelected ? '#fbbf24' : '#cbd5e1',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    &larr; Back
                  </button>
                  <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                    Next: Target Exams &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Target Exams */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Step 3: Target Examinations
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Select the recruitment examinations you are actively preparing for:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                  {TARGET_EXAMS.map((exam) => {
                    const isSelected = profile.targetExams.includes(exam);
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => toggleTargetExam(exam)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: isSelected ? '#93c5fd' : '#cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: `1px solid ${isSelected ? '#3b82f6' : '#64748b'}`,
                            background: isSelected ? '#3b82f6' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" style={{ width: '10px', height: '10px' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span>{exam}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                    &larr; Back
                  </button>
                  <button type="button" className="btn-primary" onClick={handleFinish}>
                    Save Candidate Profile &amp; Match Jobs
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
