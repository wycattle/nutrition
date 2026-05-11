// pages/combinedTotalsByDateRange/index.tsx
// Combined page: shows TotalsByDateRange (left) and NutrientTotals (right) side by side.

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import axios from 'axios';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher, defaultSwrOptions } from '../../utils/swrHelper';
import { RDA } from '../../utils/rda';

export default function CombinedTotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualTrigger, setManualTrigger] = useState(0);

  // Nutrient totals sorting state
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

  const fetchKeyTotals = shouldFetch
    ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: totalsData, error: totalsError, isValidating: loadingTotals } = useSWR(fetchKeyTotals, fetcher, defaultSwrOptions);

  const fetchKeyNutrients = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}&t=${manualTrigger}`
    : null;
  const { data: nutrientsData, error: nutrientsError, isValidating: loadingNutrients } = useSWR(fetchKeyNutrients, fetcher, defaultSwrOptions);

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const totals: any[] = totalsData?.totals || [];
  const nutrients: any[] = nutrientsData?.totals || [];

  // Nutrition details (lipids/vitamins)
  const [nutritionDetails, setNutritionDetails] = useState<{ per100g: Record<string, number>; lipidCols: string[]; vitaminCols: string[] } | null>(null);
  const [nutritionDetailsLoading, setNutritionDetailsLoading] = useState(false);

  useEffect(() => {
    if (nutrients.length === 0) { setNutritionDetails(null); return; }
    setNutritionDetailsLoading(true);
    axios.post('/api/recipe_related/nutrition_details', {
      details: nutrients.map((f: any) => ({ desc1: f.desc1, desc2: f.desc2, portion: f.portion })),
    })
      .then(res => setNutritionDetails(res.data))
      .catch(() => setNutritionDetails(null))
      .finally(() => setNutritionDetailsLoading(false));
  }, [nutrientsData]);

  // Grouped multi-index: desc1 groups → desc2 detail rows
  const groupedNutrients = useMemo(() => {
    if (!nutrients || nutrients.length === 0) return [];
    const groupMap: Record<string, any[]> = {};
    nutrients.forEach((row: any) => {
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'inline-block' }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>

      <h1>Totals by Date Range & Nutrient Totals</h1>

      {/* Date pickers */}
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
      </div>

      {/* Daily totals table */}
      <h2>Totals by Date Range</h2>
      {loadingTotals && <div>Loading...</div>}
      {totalsError && <div style={{ color: 'red' }}>Error fetching totals</div>}
      {(totals ?? []).length > 0 && (
        <>
          <div style={{ marginBottom: 4, fontSize: '0.85em', color: '#c6a3dd', fontStyle: 'italic' }}>
            Calories shown are recalculated from carb and fat only (protein excluded). Stated calories are the total in the nutrition table. Carb/fat cals are the recalculated value.  Conversion: 1g carb = 4 cal, 1g fat = 10 cal.
          </div>
          <table border={1} cellPadding={6} style={{ marginTop: 8, borderCollapse: 'collapse' }}>
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

      {/* Nutrients by food table — below daily totals */}
      <h2 style={{ marginTop: 32 }}>Nutrients by Food</h2>
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
              {groupedNutrients.map((group: any, gi: number) => (
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
      {nutrients.length === 0 && !loadingNutrients && <div>No data found for this date range.</div>}

      {/* Lipids & Vitamins breakdown */}
      {nutritionDetailsLoading && <div style={{ marginTop: 16 }}>Loading nutrition details...</div>}
      {!nutritionDetailsLoading && nutritionDetails && (() => {
        // Number of days in the selected range
        const start = startDate ? new Date(startDate) : null;
        const end = effectiveEndDate ? new Date(effectiveEndDate) : new Date();
        const numDays = start
          ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
          : 1;
        // total portion consumed across all foods
        const totalPortion = grandTotal.portion;

        const LABELS: Record<string, string> = {
          omega3: 'Omega-3 (g)', omega6: 'Omega-6 (g)', cholesterol_mg: 'Cholesterol (mg)',
          sodium_mg: 'Sodium (mg)', potassium_mg: 'Potassium (mg)', calcium_mg: 'Calcium (mg)',
          iron_mg: 'Iron (mg)', magnesium_mg: 'Magnesium (mg)', iodine_mcg: 'Iodine (mcg)',
          manganese_mg: 'Manganese (mg)', selenium_mcg: 'Selenium (mcg)', zinc_mg: 'Zinc (mg)',
          vit_a_mcg: 'Vitamin A (mcg)', vit_b1_mg: 'Vitamin B1 (mg)', vit_b2_mg: 'Vitamin B2 (mg)',
          vit_b3_mg: 'Vitamin B3 (mg)', vit_b5_mg: 'Vitamin B5 (mg)', vit_b6_mg: 'Vitamin B6 (mg)',
          vit_b12_mcg: 'Vitamin B12 (mcg)', biotin_mcg: 'Biotin (mcg)', choline_mg: 'Choline (mg)',
          folate_mcg: 'Folate (mcg)', vit_c_mg: 'Vitamin C (mg)', vit_d_mcg: 'Vitamin D (mcg)',
          vit_e_mg: 'Vitamin E (mg)', vit_k_mcg: 'Vitamin K (mcg)',
        };

        const renderSection = (title: string, cols: string[]) => (
          <div style={{ marginBottom: '1em' }}>
            <h4 style={{ color: '#f7c1c1', margin: '0 0 4px 0' }}>{title}</h4>
            <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', width: 340 }}>
              <thead>
                <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                  <th style={{ textAlign: 'left', padding: '4px 12px' }}>Nutrient</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>Avg/Day</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>% RDA</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, i) => {
                  // per100g * totalPortion = total consumed (portion=1 means 100g); divide by numDays = avg per day
                  const perDay = (nutritionDetails.per100g[col] ?? 0) * totalPortion / numDays;
                  const rda = RDA[col];
                  const pct = perDay && rda ? Math.round((perDay / rda) * 100) : null;
                  const display = perDay === 0 ? '—' : perDay < 1 ? perDay.toFixed(2) : perDay.toFixed(1);
                  return (
                    <tr key={col} style={{ background: i % 2 === 0 ? '#32232c' : '#3b2d36', color: '#c6a3dd' }}>
                      <td style={{ textAlign: 'left', padding: '3px 12px' }}>{LABELS[col] ?? col}</td>
                      <td style={{ textAlign: 'right', padding: '3px 12px' }}>{display}</td>
                      <td style={{ textAlign: 'right', padding: '3px 12px' }}>{pct !== null ? `${pct}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        return (
          <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', marginTop: '1.5em' }}>
            <div style={{ fontSize: '0.85em', color: '#c6a3dd', fontStyle: 'italic', marginBottom: '0.75em' }}>
              Averages over {numDays} day{numDays !== 1 ? 's' : ''} ({startDate} – {effectiveEndDate})
            </div>
            <div style={{ display: 'flex', gap: '2em', flexWrap: 'wrap' }}>
              {renderSection('Lipids & Minerals', nutritionDetails.lipidCols)}
              {renderSection('Vitamins', nutritionDetails.vitaminCols)}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
