/**
 * Shared SWR options for robust data freshness across the app.
 * - revalidateOnFocus: true — Refetches data when the window regains focus (keeps UI up-to-date if user switches tabs).
 * - revalidateOnReconnect: true — Refetches data when the browser reconnects after losing network (handles offline/online transitions).
 * - refreshInterval: 60000 — Refetches data every 60 seconds (ensures periodic background updates).
 * - keepPreviousData: true — Keeps showing previous data while fetching new data (prevents UI flicker during revalidation).
 */
export const defaultSwrOptions = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 60000, // 1 minute
  keepPreviousData: true,
};
// utils/swrHelper.ts
// Centralized HTTP helpers for use with SWR, data-fetching, and API calls
// Usage: import { fetcher, post } from './swrHelper';

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const post = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`POST failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
};
