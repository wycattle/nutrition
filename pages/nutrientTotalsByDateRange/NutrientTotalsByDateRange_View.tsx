// pages/nutrientTotalsByDateRange/NutrientTotalsByDateRange_View.tsx

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface NutrientTotalsByDateRangeViewProps {
  startDate: string;
  endDate: string;
  effectiveEndDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchTotals: () => void;
  totals: any[];
  loading: boolean;
  error: string;
  hideHeaderAndControls?: boolean;
}

export const NutrientTotalsByDateRange_View: React.FC<NutrientTotalsByDateRangeViewProps> = ({
  startDate = '',
  endDate = '',
  effectiveEndDate = '',
  setStartDate = () => {},
  setEndDate = () => {},
  fetchTotals = () => {},
  totals = [],
  loading = false,
  error = '',
  hideHeaderAndControls = false,
}) => {
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();

  // Sorting state for table
  const [sortCol, setSortCol] = useState<string>('calories');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Memoized sorted data
  const sortedTotals = useMemo(() => {
    if (!totals || totals.length === 0) return [];
    // Don't sort the average row
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

  // Click handler for sorting
  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  // Calculate number of days in the span (inclusive)
  let numDays = 1;
  if (startDateObj && endDateObj) {
    // Calculate difference in ms, then convert to days, add 1 for inclusive
    numDays = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (numDays < 1) numDays = 1;
  }

  const numCols = ['calories', 'carb', 'fat', 'protein', 'fiber', 'portion'];

  // Compute column totals for the summary row
  const colTotals = numCols.reduce((acc, col) => {
    acc[col] = totals.reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  // Calculate averages per day for the grand total row
  const colAverages = numCols.reduce((acc, col) => {
    acc[col] = numDays > 0 ? colTotals[col] / numDays : 0;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {!hideHeaderAndControls && (
        <>
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
            <button onClick={fetchTotals} style={{ marginLeft: 16 }}>Fetch Totals</button>
          </div>
        </>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {totals.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontSize: '1.08em', color: '#f7c1c1', fontWeight: 500 }}>
            This table aggregates (sum) nutrients by desc2 and shows the average in the bottom row. All columns are sortable, just click the header.
          </div>
          <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 0, borderCollapse: 'collapse', cursor: 'pointer' }}>
            <thead>
              <tr style={{ background: '#333' }}>
                <th style={{ textAlign: 'left' }} onClick={() => handleSort('desc1')}>Food Group (desc1)</th>
                <th style={{ textAlign: 'left' }} onClick={() => handleSort('desc2')}>Food (desc2)</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('calories')}>Calories{sortCol === 'calories' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('carb')}>Carb{sortCol === 'carb' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fat')}>Fat{sortCol === 'fat' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('protein')}>Protein{sortCol === 'protein' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fiber')}>Fiber{sortCol === 'fiber' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('portion')}>Portion{sortCol === 'portion' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTotals.map((row: any, i: number) => (
                <tr key={i}>
                  <td style={{ textAlign: 'left' }}>{row.desc1}</td>
                  <td style={{ textAlign: 'left' }}>{row.desc2}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.calories).toFixed(0)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.carb).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.fat).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.protein).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.fiber).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.portion).toFixed(0)}</td>
                </tr>
              ))}
              {/* Grand total row (average per day) */}
              <tr style={{ fontWeight: 'bold', background: '#222' }}>
                <td colSpan={2}>Avg/Day (over {numDays} day{numDays !== 1 ? 's' : ''})</td>
                <td style={{ textAlign: 'right' }}>{colAverages.calories.toFixed(0)}</td>
                <td style={{ textAlign: 'right' }}>{colAverages.carb.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{colAverages.fat.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{colAverages.protein.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{colAverages.fiber.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{colAverages.portion.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {totals.length === 0 && !loading && (
        <div>No data found for this date range.</div>
      )}
    </div>
  );
};

export default NutrientTotalsByDateRange_View;
