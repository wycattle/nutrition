// pages/combinedTotalsByDateRange/index.tsx

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher } from '../../utils/helper';
import { TotalsByDateRange_View } from '../totalsByDateRange/TotalsByDateRange_View';
import { NutrientTotalsByDateRange_View } from '../nutrientTotalsByDateRange/NutrientTotalsByDateRange_View';

export default function CombinedTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return new Date().toISOString().slice(0, 10);
  }, [endDate]);

  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;

  // Fetch for TotalsByDateRange
  const fetchKeyTotals = shouldFetch
    ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: totalsData, error: totalsError, isValidating: loadingTotals } = useSWR(fetchKeyTotals, fetcher, { revalidateOnFocus: false });

  // Fetch for NutrientTotalsByDateRange
  const fetchKeyNutrients = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: nutrientsData, error: nutrientsError, isValidating: loadingNutrients } = useSWR(fetchKeyNutrients, fetcher, { revalidateOnFocus: false });

  const fetchBoth = () => setManualTrigger(x => x + 1);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, margin: 0, zIndex: 10 }}>
        <a href="/">
          <span className="globalButton">Back to Home Page</span>
        </a>
      </div>
      <h1 style={{ marginTop: 48 }}>Combined Totals by Date Range & Nutrient Totals</h1>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 520px', minWidth: 400, marginRight: 32 }}>
          <TotalsByDateRange_View
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            fetchTotals={fetchBoth}
            totals={totalsData?.totals || []}
            loading={loadingTotals}
            error={totalsError ? 'Error fetching totals' : ''}
            hideHeaderAndControls={true}
          />
        </div>
        <div style={{ flex: 2, minWidth: 600, marginTop: 120 }}>
          <NutrientTotalsByDateRange_View
            startDate={startDate}
            endDate={endDate}
            effectiveEndDate={effectiveEndDate}
            setStartDate={() => {}}
            setEndDate={() => {}}
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
