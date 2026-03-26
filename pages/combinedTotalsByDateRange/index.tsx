// pages/combinedTotalsByDateRange/index.tsx
// Combined page: shows TotalsByDateRange (left) and NutrientTotals (right) side by side.

import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher } from '../../utils/helper';

export default function CombinedTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  // Nutrient totals sorting state
  const [sortCol, setSortCol] = useState<string>('calories');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return new Date().toISOString().slice(0, 10);
  }, [endDate]);

  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;

  const fetchKeyTotals = shouldFetch
    ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: totalsData, error: totalsError, isValidating: loadingTotals } = useSWR(fetchKeyTotals, fetcher, { revalidateOnFocus: false });

  const fetchKeyNutrients = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: nutrientsData, error: nutrientsError, isValidating: loadingNutrients } = useSWR(fetchKeyNutrients, fetcher, { revalidateOnFocus: false });

  const fetchBoth = () => setManualTrigger(x => x + 1);

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const totals: any[] = totalsData?.totals || [];
  const nutrients: any[] = nutrientsData?.totals || [];

  // Nutrient totals: sorted rows and grand total
  const sortedNutrients = useMemo(() => {
    if (!nutrients || nutrients.length === 0) return [];
    const dataRows = nutrients.filter((row: any) => !String(row.desc1).toLowerCase().includes('avg'));
    const avgRows = nutrients.filter((row: any) => String(row.desc1).toLowerCase().includes('avg'));
    const sorted = [...dataRows].sort((a, b) => {
      const aVal = Number(a[sortCol]) || 0;
      const bVal = Number(b[sortCol]) || 0;
      if (sortDir === 'asc') return aVal - bVal;
      return bVal - aVal;
    });
    return [...sorted, ...avgRows];
  }, [nutrients, sortCol, sortDir]);

  const grandTotal = useMemo(() => {
    const dataRows = nutrients.filter((row: any) => !String(row.desc1).toLowerCase().includes('avg'));
    return dataRows.reduce((acc, row) => ({
      calories: acc.calories + (Number(row.calories) || 0),
      carb:     acc.carb     + (Number(row.carb)     || 0),
      fat:      acc.fat      + (Number(row.fat)      || 0),
      protein:  acc.protein  + (Number(row.protein)  || 0),
      fiber:    acc.fiber    + (Number(row.fiber)     || 0),
      portion:  acc.portion  + (Number(row.portion)  || 0),
    }), { calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0, portion: 0 });
  }, [nutrients]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, margin: 0, zIndex: 10 }}>
        <a href="/">
          <span className="globalButton">Back to Home Page</span>
        </a>
      </div>

      <h1 style={{ marginTop: 48 }}>Totals by Date Range & Nutrient Totals</h1>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'nowrap', alignItems: 'flex-start' }}>

        {/* LEFT: daily totals table + date pickers + fetch button */}
        <div style={{ flex: '0 0 520px', minWidth: 400, marginRight: 32 }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, position: 'relative' }}>
            <h2 style={{ marginTop: 48 }}>Totals by Date Range - today's date is default end date, but modify if you want</h2>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: 8 }}>
                Start Date:
                <DatePicker
                  selected={startDateObj}
                  onChange={date => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      setStartDate(`${y}-${m}-${d}`);
                    } else {
                      setStartDate('');
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  maxDate={endDateObj || undefined}
                  placeholderText="Select start date"
                  isClearable
                />
              </label>
              <label style={{ marginLeft: 16, marginRight: 8 }}>
                End Date:
                <DatePicker
                  selected={endDateObj}
                  onChange={date => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      setEndDate(`${y}-${m}-${d}`);
                    } else {
                      setEndDate('');
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={startDateObj || undefined}
                  placeholderText="Select end date"
                  isClearable={false}
                />
              </label>
              <button onClick={fetchBoth} style={{ marginLeft: 16 }}>Fetch Totals</button>
            </div>
            {loadingTotals && <div>Loading...</div>}
            {totalsError && <div style={{ color: 'red' }}>Error fetching totals</div>}
            {(totals ?? []).length > 0 && (
              <>
                <div style={{ marginBottom: 4, fontSize: '0.85em', color: '#c6a3dd', fontStyle: 'italic' }}>
                  Calories shown are recalculated from carb and fat only (protein excluded). Stated calories are the total in the nutrition table. Carb/fat cals are the recalculated value.  Conversion: 1g carb = 4 cal, 1g fat = 10 cal.
                </div>
                <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Date</th>
                      <th style={{ textAlign: 'right' }}>Stated Calories</th>
                      <th style={{ textAlign: 'right' }}>Carb/Fat Cals</th>
                      <th style={{ textAlign: 'right' }}>Carb_cals</th>
                      <th style={{ textAlign: 'right' }}>Fat_cals</th>
                      <th style={{ textAlign: 'right' }}>Carb (g)</th>
                      <th style={{ textAlign: 'right' }}>Fat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.filter((row: any) => row.date !== 'Average').map((row: any) => {
                      const carb_cals = (Number(row.carbTot) || 0) * 4.5;
                      const fat_cals = (Number(row.fatTot) || 0) * 9.5;
                      const carb_fat_cals = carb_cals + fat_cals;
                      return (
                        <tr key={row.date}>
                          <td style={{ textAlign: 'center' }}>{typeof row.date === 'string' && row.date.length >= 10 ? row.date.slice(0, 10) : row.date}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(Number(row.caloriesTot) || 0)}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(carb_fat_cals)}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(carb_cals)}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(fat_cals)}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(Number(row.carbTot) || 0)}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(Number(row.fatTot) || 0)}</td>
                        </tr>
                      );
                    })}
                    {totals.length > 0 && totals[totals.length - 1].date === 'Average' && (() => {
                      const avg = totals[totals.length - 1];
                      const carb_cals = (Number(avg.carbTot) || 0) * 4.0;
                      const fat_cals = (Number(avg.fatTot) || 0) * 9.0;
                      const carb_fat_cals = carb_cals + fat_cals;
                      return (
                        <tr style={{ fontWeight: 'bold', background: '#222', color: '#c6a3dd', borderTop: '3px solid #725e5e', borderBottom: '3px solid #725e5e' }}>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'center' }}>Average</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(Number(avg.caloriesTot) || 0)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(carb_fat_cals)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(carb_cals)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(fat_cals)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(Number(avg.carbTot) || 0)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.15em', background: '#222', color: '#f7c1c1', border: '2px solid #725e5e', textAlign: 'right' }}>{Math.round(Number(avg.fatTot) || 0)}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </>
            )}
            {(totals ?? []).length === 0 && !loadingTotals && <div>No totals found for this range.</div>}
          </div>
        </div>

        {/* RIGHT: per-food nutrient totals table */}
        <div style={{ flex: 2, minWidth: 600, marginTop: 120 }}>
          {loadingNutrients && <div>Loading...</div>}
          {nutrientsError && <div style={{ color: 'red' }}>Error fetching data</div>}
          {nutrients.length > 0 && (
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
                  {sortedNutrients.map((row: any, i: number) => (
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
          {nutrients.length === 0 && !loadingNutrients && <div>No data found for this date range.</div>}
        </div>
      </div>
    </div>
  );
}
