/**
 * API base URL for browser fetches.
 * Same-origin default: /api (unified Next.js app).
 * Override with NEXT_PUBLIC_API_URL when UI and API are split.
 */

export function getApiBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return '/api';
}

export const API_BASE = getApiBaseUrl();
