// utils/helper.ts
// Centralized HTTP helpers for use with SWR, data-fetching, and API calls
// Usage: import { fetcher, post } from './helper';

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
