// pages/combinedTotalsByDateRange/index.tsx
// Combined page: shows TotalsByDateRange (left) and NutrientTotals (right) side by side.
// This page owns all data fetching; the two child View components are pure display.

// useState: React hook — like a class instance variable that triggers a re-render when set.
// useMemo: React hook — like Python's @cached_property; recomputes only when dependencies change.
import React, { useState, useMemo } from 'react';

// useSWR: data-fetching hook. Given a URL key, it fires a GET request and returns
// { data, error, isValidating }. Re-fetches automatically whenever the key string changes.
import useSWR from 'swr';

// Returns the base API URL (e.g. "http://localhost:3000") based on environment.
import { getApiUrl } from '../../utils/getApiUrl';

// fetcher: simple wrapper — fetch(url).then(r => r.json()). Passed to useSWR as the GET function.
import { fetcher } from '../../utils/helper';

// Reusable view components. Each is also used by its own standalone page.
import { TotalsByDateRange_View } from '../totalsByDateRange/TotalsByDateRange_View';
import { NutrientTotalsByDateRange_View } from '../nutrientTotalsByDateRange/NutrientTotalsByDateRange_View';

export default function CombinedTotalsByDateRange() {
  // startDate / endDate: controlled by the date pickers inside TotalsByDateRange_View.
  // They live here (not in the child) so both views share the same date range.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // manualTrigger: an integer that is incremented each time the user clicks "Fetch".
  // Including it in the SWR key string forces a re-fetch even if the dates haven't changed.
  const [manualTrigger, setManualTrigger] = useState(0);

  // effectiveEndDate: if the user hasn't set an end date, default to today.
  // useMemo means this only recalculates when endDate changes — not on every render.
  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  }, [endDate]);

  // Base URL for all API calls (e.g. "http://localhost:3000").
  const apiUrl = getApiUrl();

  // Guard: don't fetch at all until the user has chosen a start date.
  // !! converts a string to boolean: '' → false, '2026-03-01' → true.
  const shouldFetch = !!startDate;

  // --- Fetch 1: daily calorie/macro totals (left table) ---
  // The key is a URL string. useSWR watches it; when it changes, a new GET request fires.
  // If shouldFetch is false, key is null → useSWR skips the request entirely.
  const fetchKeyTotals = shouldFetch
    ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  // Destructuring with renaming: data → totalsData, error → totalsError, isValidating → loadingTotals.
  // isValidating is true while a request is in-flight (like a "loading" boolean).
  const { data: totalsData, error: totalsError, isValidating: loadingTotals } = useSWR(fetchKeyTotals, fetcher, { revalidateOnFocus: false });

  // --- Fetch 2: per-food nutrient totals (right table) ---
  const fetchKeyNutrients = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: nutrientsData, error: nutrientsError, isValidating: loadingNutrients } = useSWR(fetchKeyNutrients, fetcher, { revalidateOnFocus: false });

  // fetchBoth: called when the user clicks "Fetch Totals".
  // Incrementing manualTrigger changes both SWR key strings → both fetches fire simultaneously.
  const fetchBoth = () => setManualTrigger(x => x + 1);

  return (
    // Outer container: wide enough to fit both tables side by side.
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24, position: 'relative' }}>

      {/* "Back" button pinned to the top-left corner via position:absolute */}
      <div style={{ position: 'absolute', top: 0, left: 0, margin: 0, zIndex: 10 }}>
        <a href="/">
          <span className="globalButton">Back to Home Page</span>
        </a>
      </div>

      <h1 style={{ marginTop: 48 }}>Totals by Date Range & Nutrient Totals</h1>

      {/* Flex row: left panel (fixed ~520px) + right panel (grows to fill remaining space) */}
      <div style={{ display: 'flex', gap: 32, flexWrap: 'nowrap', alignItems: 'flex-start' }}>

        {/* LEFT: daily totals table + date pickers + fetch button */}
        {/* flex: '0 0 520px' means "don't grow, don't shrink, stay at 520px" */}
        <div style={{ flex: '0 0 520px', minWidth: 400, marginRight: 32 }}>
          <TotalsByDateRange_View
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}       // called by DatePicker to update state here
            setEndDate={setEndDate}           // called by DatePicker to update state here
            fetchTotals={fetchBoth}           // called by the Fetch button
            totals={totalsData?.totals || []} // "?." = safe navigation: undefined if no data yet; "|| []" = default to empty array
            loading={loadingTotals}           // true while HTTP request is in-flight
            error={totalsError ? 'Error fetching totals' : ''}
            hideHeaderAndControls={true}      // suppress the child's own Back button and title (this page owns those)
          />
        </div>

        {/* RIGHT: per-food nutrient totals table */}
        {/* marginTop:120 visually aligns the table with the left table (below the date pickers) */}
        <div style={{ flex: 2, minWidth: 600, marginTop: 120 }}>
          <NutrientTotalsByDateRange_View
            startDate={startDate}
            endDate={endDate}
            effectiveEndDate={effectiveEndDate}
            setStartDate={() => {}}           // no-op: date changes are controlled by the left panel only
            setEndDate={() => {}}             // no-op: same reason
            fetchTotals={fetchBoth}
            totals={nutrientsData?.totals || []}
            loading={loadingNutrients}
            error={nutrientsError ? 'Error fetching data' : ''}
            hideHeaderAndControls={true}
          />
        </div>
      </div>
    </div>
  );
}
