'use client';

export interface CandidateProfile {
  qualification: string;
  discipline: string;
  age: number;
  category: string;
  state: string;
  targetExams: string[];
  savedAt?: string;
}

export const PROFILE_STORAGE_KEY = 'notifygov_user_profile';
export const PROFILE_COOKIE_KEY = 'notifygov_profile';

/**
 * Retrieves the saved candidate profile from localStorage or fallback cookie.
 * Ensures persistence even across mobile webviews, app browser tabs, and page refreshes.
 */
export function getSavedProfile(): CandidateProfile | null {
  if (typeof window === 'undefined') return null;

  // 1. Check localStorage first
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.qualification) {
        return parsed;
      }
    }
  } catch (err) {
    // localStorage might be blocked or restricted in some webviews
  }

  // 2. Fallback to 1-year cookie for mobile browsers / WebView sandboxes
  try {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === PROFILE_COOKIE_KEY && val) {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed && parsed.qualification) {
          // Sync back to localStorage for consistency
          try {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed));
          } catch {}
          return parsed;
        }
      }
    }
  } catch (err) {
    // Cookie parsing error
  }

  return null;
}

/**
 * Persists the candidate profile to both localStorage and a 1-year persistent cookie.
 * Dispatches an event so all mounted components (Header, Feed, Alerts) update immediately.
 */
export function saveProfile(profile: CandidateProfile): void {
  if (typeof window === 'undefined') return;

  const data: CandidateProfile = {
    ...profile,
    savedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(data);

  // 1. Write to localStorage
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, serialized);
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }

  // 2. Write to persistent cookie (1-year max-age, path=/, SameSite=Lax)
  try {
    const encoded = encodeURIComponent(serialized);
    document.cookie = `${PROFILE_COOKIE_KEY}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    console.warn('cookie write failed:', e);
  }

  // 3. Broadcast update to active tabs and components
  try {
    window.dispatchEvent(new CustomEvent('notifygov_profile_updated', { detail: data }));
  } catch {}
}

/**
 * Clears the candidate profile from both storage mediums.
 */
export function clearProfile(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {}

  try {
    document.cookie = `${PROFILE_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent('notifygov_profile_updated', { detail: null }));
  } catch {}
}
