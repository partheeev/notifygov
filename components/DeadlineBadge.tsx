import React from 'react';

export interface DeadlineBadgeProps {
  deadline?: string | null;
  applicationStart?: string | null;
  daysLeft?: number | null;
  className?: string;
}

export default function DeadlineBadge({
  deadline,
  applicationStart,
  daysLeft: explicitDaysLeft,
  className = '',
}: DeadlineBadgeProps) {
  // Compute daysLeft if not explicitly provided
  let computedDaysLeft: number | null = explicitDaysLeft ?? null;

  if (computedDaysLeft === null && deadline) {
    const deadlineTime = new Date(deadline).getTime();
    if (!isNaN(deadlineTime)) {
      const diffMs = deadlineTime - Date.now();
      computedDaysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  // Format label and style classes
  let text = 'Ongoing';
  let badgeType: 'green' | 'amber' | 'red' | 'closed' | 'open' = 'open';
  let isUrgent = false;

  if (computedDaysLeft !== null) {
    if (computedDaysLeft < 0) {
      text = 'Closed';
      badgeType = 'closed';
    } else if (computedDaysLeft === 0) {
      text = 'Closes Today';
      badgeType = 'red';
      isUrgent = true;
    } else if (computedDaysLeft === 1) {
      text = '1 day left';
      badgeType = 'red';
      isUrgent = true;
    } else if (computedDaysLeft <= 7) {
      text = `${computedDaysLeft} days left`;
      badgeType = 'red';
      isUrgent = true;
    } else if (computedDaysLeft <= 30) {
      text = `${computedDaysLeft} days left`;
      badgeType = 'amber';
    } else {
      text = `${computedDaysLeft} days left`;
      badgeType = 'green';
    }
  } else if (!deadline) {
    text = 'No Deadline';
    badgeType = 'open';
  }

  // Calendar / clock icon SVG
  return (
    <div
      className={`deadline-badge deadline-${badgeType} ${isUrgent ? 'pulse-urgent' : ''} ${className}`}
      title={deadline ? `Deadline: ${new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : undefined}
    >
      <svg
        className="deadline-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="deadline-text">{text}</span>
    </div>
  );
}
