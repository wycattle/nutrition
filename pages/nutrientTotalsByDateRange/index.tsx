// pages/nutrientTotalsByDateRange/index.tsx

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher, defaultSwrOptions } from '../../utils/swrHelper';

export default function NutrientTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  // Sorting state for table
  const [sortCol, setSortCol] = useState<string>('carb');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Collapsible groups: Set of desc1 keys that are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (desc1: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(desc1)) next.delete(desc1); else next.add(desc1);
      return next;
    });
  };

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return new Date().toISOString().slice(0, 10);
  }, [endDate]);

  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;
  const fetchKey = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;

  const { data, error, isValidating } = useSWR(fetchKey, fetcher, defaultSwrOptions);

  const totals: any[] = data?.totals || [];
  const loading = isValidating;
  const errorMessage = error ? 'Error fetching data' : '';

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();

  // Grouped multi-index data: desc1 groups → desc2 detail rows
  const groupedTotals = useMemo(() => {
    if (!totals || totals.length === 0) return [];
    const groupMap: Record<string, any[]> = {};
    totals.forEach((row: any) => {
      const key = row.desc1 ?? '(unknown)';
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(row);
    });
    const groups = Object.entries(groupMap).map(([desc1, rows]) => {
      const subtotal = rows.reduce((acc: any, row: any) => ({
        calories: acc.calories + (Number(row.calories) || 0),
        carb:     acc.carb     + (Number(row.carb)     || 0),
        fat:      acc.fat      + (Number(row.fat)      || 0),
        protein:  acc.protein  + (Number(row.protein)  || 0),
        fiber:    acc.fiber    + (Number(row.fiber)     || 0),
        portion:  acc.portion  + (Number(row.portion)  || 0),
      }), { calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0, portion: 0 });
      const col = sortCol === 'desc1' ? 'desc2' : sortCol;
      const sortedRows = [...rows].sort((a: any, b: any) => {
        const aRaw = a[col]; const bRaw = b[col];
        const aNum = Number(aRaw); const bNum = Number(bRaw);
        if (!isNaN(aNum) && !isNaN(bNum)) return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
        return sortDir === 'asc'
          ? String(aRaw ?? '').localeCompare(String(bRaw ?? ''))
          : String(bRaw ?? '').localeCompare(String(aRaw ?? ''));
      });
      return { desc1, rows: sortedRows, subtotal };
    });
    groups.sort((a, b) => {
      if (sortCol === 'desc1' || sortCol === 'desc2') {
        return sortDir === 'asc' ? a.desc1.localeCompare(b.desc1) : b.desc1.localeCompare(a.desc1);
      }
      const aVal = (a.subtotal as any)[sortCol] as number;
      const bVal = (b.subtotal as any)[sortCol] as number;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return groups;
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
      <div style={{ display: 'inline-block' }}>
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
        {/* <button onClick={() => setManualTrigger(x => x + 1)} style={{ marginLeft: 16 }}>Fetch Totals</button> */}
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
                <th style={{ textAlign: 'left' }} onClick={() => handleSort('desc1')}>Food Group → Food {sortCol === 'desc1' || sortCol === 'desc2' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('calories')}>Calories {sortCol === 'calories' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('carb')}>Carb {sortCol === 'carb' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fat')}>Fat {sortCol === 'fat' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('protein')}>Protein {sortCol === 'protein' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('fiber')}>Fiber {sortCol === 'fiber' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
                <th style={{ textAlign: 'right' }} onClick={() => handleSort('portion')}>Portion {sortCol === 'portion' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</th>
              </tr>
            </thead>
            <tbody>
              {groupedTotals.map((group: any, gi: number) => (
                <React.Fragment key={gi}>
                  <tr
                    style={{ background: '#3a2535', fontWeight: 'bold', color: '#f7c1c1', borderTop: '2px solid #725e5e', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleGroup(group.desc1)}
                  >
                    <td style={{ textAlign: 'left', textTransform: 'uppercase', fontSize: '0.9em', letterSpacing: '0.04em' }}>
                      {expandedGroups.has(group.desc1) ? '▾' : '▸'} {group.desc1}
                    </td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.calories.toFixed(0)}</td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.carb.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.fat.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.protein.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.fiber.toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{group.subtotal.portion.toFixed(0)}</td>
                  </tr>
                  {expandedGroups.has(group.desc1) && group.rows.map((row: any, i: number) => (
                    <tr key={i} style={{ background: '#1c1c1c' }}>
                      <td style={{ textAlign: 'left', paddingLeft: 24, color: '#ccc', fontSize: '0.95em' }}>{row.desc2}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.calories).toFixed(0)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.carb).toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.fat).toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.protein).toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.fiber).toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.portion).toFixed(0)}</td>
                    </tr>
                  ))}
                </React.Fragment>
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
