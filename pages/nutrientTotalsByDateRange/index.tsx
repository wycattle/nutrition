// pages/nutrientTotalsByDateRange/index.tsx

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher } from '../../utils/helper';

export default function NutrientTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  // Sorting state for table
  const [sortCol, setSortCol] = useState<string>('calories');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  const totals: any[] = data?.totals || [];
  const loading = isValidating;
  const errorMessage = error ? 'Error fetching data' : '';

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();

  // Memoized sorted data
  const sortedTotals = useMemo(() => {
    if (!totals || totals.length === 0) return [];
    const dataRows = totals.filter((row: any) => !String(row.desc1).toLowerCase().includes('avg'));
    const avgRows = totals.filter((row: any) => String(row.desc1).toLowerCase().includes('avg'));
    const sorted = [...dataRows].sort((a, b) => {
      const aVal = Number(a[sortCol]) || 0;
      const bVal = Number(b[sortCol]) || 0;
      if (sortDir === 'asc') return aVal - bVal;
      return bVal - aVal;
    });
    return [...sorted, ...avgRows];
  }, [totals, sortCol, sortDir]);

  // Summed totals across all data rows (excluding any avg rows)
  const grandTotal = useMemo(() => {
    const dataRows = totals.filter((row: any) => !String(row.desc1).toLowerCase().includes('avg'));
    return dataRows.reduce((acc, row) => ({
      calories: acc.calories + (Number(row.calories) || 0),
      carb:     acc.carb     + (Number(row.carb)     || 0),
      fat:      acc.fat      + (Number(row.fat)      || 0),
      protein:  acc.protein  + (Number(row.protein)  || 0),
      fiber:    acc.fiber    + (Number(row.fiber)     || 0),
      portion:  acc.portion  + (Number(row.portion)  || 0),
    }), { calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0, portion: 0 });
  }, [totals]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>
      <h2>
        Nutrient Averages by Date Range
        {startDate && (
          <span style={{ fontSize: '0.85em', fontWeight: 'normal', marginLeft: 16 }}>
            {startDate} → {effectiveEndDate}
          </span>
        )}
      </h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <label>
          Start Date:&nbsp;
          <DatePicker
            selected={startDateObj}
            onChange={date => setStartDate(date ? date.toISOString().slice(0, 10) : '')}
            dateFormat="yyyy-MM-dd"
            maxDate={endDateObj || undefined}
            placeholderText="Select start date"
            isClearable
          />
        </label>
        <label style={{ marginLeft: 16 }}>
          End Date:&nbsp;
          <DatePicker
            selected={endDateObj}
            onChange={date => setEndDate(date ? date.toISOString().slice(0, 10) : '')}
            dateFormat="yyyy-MM-dd"
            minDate={startDateObj || undefined}
            placeholderText="Select end date"
            isClearable={false}
          />
        </label>
        <button onClick={() => setManualTrigger(x => x + 1)} style={{ marginLeft: 16 }}>Fetch Totals</button>
      </div>

      {loading && <div>Loading...</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

      {totals.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontSize: '1.08em', color: '#f7c1c1', fontWeight: 500 }}>
            Nutrients aggregated (summed) by food. Click any column header to sort.
          </div>
          <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 0, borderCollapse: 'collapse', cursor: 'pointer' }}>
            <thead>
              <tr style={{ background: '#333' }}>
                <th style={{ textAlign: 'left' }} onClick={() => handleSort('desc1')}>Food Group (desc1)</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('calories')}>Calories {sortCol === 'calories' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('carb')}>Carb {sortCol === 'carb' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fat')}>Fat {sortCol === 'fat' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('protein')}>Protein {sortCol === 'protein' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fiber')}>Fiber {sortCol === 'fiber' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('portion')}>Portion {sortCol === 'portion' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTotals.map((row: any, i: number) => (
                <tr key={i}>
                  <td style={{ textAlign: 'left' }}>{row.desc1}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.calories).toFixed(0)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.carb).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.fat).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.protein).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.fiber).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.portion).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 'bold', background: '#222', color: '#f7c1c1', borderTop: '3px solid #725e5e' }}>
                <td style={{ textAlign: 'left' }}>Total</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.calories.toFixed(0)}</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.carb.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.fat.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.protein.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.fiber.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{grandTotal.portion.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      {totals.length === 0 && !loading && (
        <div>No data found for this date range.</div>
      )}
    </div>
  );
}
