'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSavedProfile, saveProfile, clearProfile, CandidateProfile } from '@/lib/profile';

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
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [profile, setProfile] = useState<CandidateProfileState>({
    qualification: 'Graduation (Any Discipline)',
    discipline: 'General / Non-Technical',
    age: 24,
    category: 'General',
    state: 'Delhi (NCT)',
    targetExams: ['UPSC Civil Services (IAS/IPS)', 'SSC CGL (Group B/C)'],
  });

  // Restore saved profile from localStorage / persistent cookie on mount
  useEffect(() => {
    const existing = getSavedProfile();
    if (existing) {
      setProfile({
        qualification: existing.qualification || 'Graduation (Any Discipline)',
        discipline: existing.discipline || 'General / Non-Technical',
        age: existing.age || 24,
        category: existing.category || 'General',
        state: existing.state || 'Delhi (NCT)',
        targetExams: existing.targetExams && existing.targetExams.length > 0
          ? existing.targetExams
          : ['UPSC Civil Services (IAS/IPS)', 'SSC CGL (Group B/C)'],
      });
      setHasSavedProfile(true);
    }

    // Check if Supabase user is logged in
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
    // 1. Save to both localStorage and 1-year cookie
    saveProfile(profile);
    setHasSavedProfile(true);
    setIsEditing(false);

    // 2. If user already logged in via Supabase, sync to cloud user_profiles
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

  const handleResetProfile = () => {
    if (confirm('Reset your saved eligibility profile?')) {
      clearProfile();
      setHasSavedProfile(false);
      setIsEditing(true);
      setStep(1);
      setProfile({
        qualification: 'Graduation (Any Discipline)',
        discipline: 'General / Non-Technical',
        age: 24,
        category: 'General',
        state: 'Delhi (NCT)',
        targetExams: ['UPSC Civil Services (IAS/IPS)', 'SSC CGL (Group B/C)'],
      });
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Cloud sign-in requires Supabase environment variables configured in Vercel. Your profile is already safely stored on this device!');
      return;
    }

    setAuthLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/notifications`,
        },
      });
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

        {/* Step indicator (only visible when in wizard mode) */}
        {(!hasSavedProfile || isEditing) && !saved && (
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
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* CASE 1: Profile already saved, viewing status */}
        {hasSavedProfile && !isEditing && !saved && (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
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

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
              <span className="dot-live" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Profile Saved on This Device
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Your Eligibility Is Configured
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
              You don&apos;t need to sign in every time. Your degree and age criteria are permanently active in this browser.
            </p>

            {/* Profile Overview Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                textAlign: 'left',
                maxWidth: '520px',
                margin: '0 auto 2rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Qualification
                  </span>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600 }}>
                    {profile.qualification}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Stream / Branch
                  </span>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600 }}>
                    {profile.discipline}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Age &amp; Category
                  </span>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600 }}>
                    {profile.age} years • {profile.category}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Target Exams
                  </span>
                  <span style={{ fontSize: '0.92rem', color: '#fbbf24', fontWeight: 600 }}>
                    {profile.targetExams.length} selected
                  </span>
                </div>
              </div>

              {profile.targetExams.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {profile.targetExams.map((ex) => (
                    <span
                      key={ex}
                      style={{
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#93c5fd',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/notifications" className="btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}>
                View 6 Eligible Matches &rarr;
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setStep(1);
                }}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.92rem' }}
              >
                Modify Preferences
              </button>
              <button
                type="button"
                onClick={handleResetProfile}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '0.5rem',
                }}
              >
                Reset Profile
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: Just clicked save confirmation */}
        {saved && (
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
              Profile Successfully Saved!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Your qualifications are stored on this device. You qualify for{' '}
              <strong style={{ color: '#34d399' }}>6 central government recruitment drives</strong> right now!
            </p>

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
              ✓ Saved permanently via browser storage &amp; cookies. No sign-in required!
            </div>

            {/* Optional Google Sync (only rendered if Supabase keys are active) */}
            {isSupabaseConfigured && !currentUser && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  maxWidth: '520px',
                  margin: '0 auto 2rem',
                }}
              >
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                  Want to sync across multiple phones? Sign in with Google:
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="btn-secondary"
                  style={{ fontSize: '0.86rem' }}
                >
                  {authLoading ? 'Connecting...' : 'Sync with Google'}
                </button>
              </div>
            )}

            {/* Direct action links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/notifications" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                View My 6 Eligible Notifications &rarr;
              </Link>
              <Link href="/" className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                Browse All Feeds
              </Link>
            </div>
          </div>
        )}

        {/* CASE 3: Wizard Mode (New candidate or Editing) */}
        {(!hasSavedProfile || isEditing) && !saved && (
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

                <div style={{ display: 'flex', justifyContent: isEditing ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setIsEditing(false)}
                      style={{ fontSize: '0.84rem' }}
                    >
                      Cancel
                    </button>
                  )}
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
