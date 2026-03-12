// pages/nutrientTotalsByDateRange/index.tsx

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { NutrientTotalsByDateRange_View } from './NutrientTotalsByDateRange_View';
import { fetcher } from '../../utils/helper';

export default function NutrientTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return new Date().toISOString().slice(0, 10);
  }, [endDate]);

  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;
  const fetchKey = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;

  const { data, error, isValidating } = useSWR(fetchKey, fetcher, { revalidateOnFocus: false });

  return (
    <NutrientTotalsByDateRange_View
      startDate={startDate}
      endDate={endDate}
      effectiveEndDate={effectiveEndDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      fetchTotals={() => setManualTrigger(x => x + 1)}
      totals={data?.totals || []}
      loading={isValidating}
      error={error ? 'Error fetching data' : ''}
    />
  );
}
