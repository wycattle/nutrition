//pages\totalsByDateRange\index.tsx
/**
 * pages/totalsByDateRange/index.tsx
 * Totals by date range page for my_nutrition_app
 */

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { TotalsByDateRange_View } from './TotalsByDateRange_View';
import { fetcher } from '../../utils/helper';

export default function TotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0); // for refetching

  // Compute effectiveEndDate (today if not set)
  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [endDate]);

  // Build the API URL
  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;
  const fetchKey = shouldFetch ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}` : null;

  // Use shared fetcher utility for SWR data fetching
  const { data, error, isValidating } = useSWR(fetchKey, fetcher, { revalidateOnFocus: false });

  const fetchTotals = () => {
    setManualTrigger(x => x + 1);
  };

  return (
    <TotalsByDateRange_View
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      fetchTotals={fetchTotals}
      totals={data?.totals || []}
      loading={isValidating}
      error={error ? 'Error fetching totals' : ''}
    />
  );
}
