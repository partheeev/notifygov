'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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

  const toggleTargetExam = (exam: string) => {
    setProfile((prev) => {
      const exists = prev.targetExams.includes(exam);
      if (exists) {
        return { ...prev, targetExams: prev.targetExams.filter((e) => e !== exam) };
      }
      return { ...prev, targetExams: [...prev.targetExams, exam] };
    });
  };

  const handleFinish = () => {
    // Save to localStorage for client-side matching demo
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifygov_user_profile', JSON.stringify(profile));
    }
    setSaved(true);
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
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Profile Setup Complete!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
              Your profile is matched against all central government posts. You are currently eligible for <strong>6 active recruitment drives</strong>!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-primary">
                View My Eligible Notifications
              </Link>
              <Link href="/notifications" className="btn-secondary">
                Go to Alert Inbox
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Qualification & Discipline */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1.25rem' }}>
                  Step 1: Educational Qualification & Stream
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
                    Next: Age & Category &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Age & Reservation Category */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1.25rem' }}>
                  Step 2: Age & Reservation Category
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
                    RESERVATION CATEGORY (FOR AGE RELAXATION & FEE CONCESSION)
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
                    Save Candidate Profile & Activate Alerts
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
