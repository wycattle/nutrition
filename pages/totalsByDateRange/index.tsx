//pages\totalsByDateRange\index.tsx
/**
 * pages/totalsByDateRange/index.tsx
 * Totals by date range page for my_nutrition_app
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSWR from 'swr';
import axios from 'axios';
import { getApiUrl } from '../../utils/getApiUrl';
import { fetcher } from '../../utils/helper';
import { RDA } from '../../utils/rda';

export default function TotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [endDate]);

  const apiUrl = getApiUrl();
  const shouldFetch = !!startDate;
  const fetchKey = shouldFetch ? `${apiUrl}/api/meal_related/meal_totals_by_date?start=${startDate}&end=${effectiveEndDate}` : null;

  const { data, error, isValidating } = useSWR(fetchKey, fetcher, { revalidateOnFocus: false });

  const totals: any[] = data?.totals || [];
  const loading = isValidating;
  const errorMessage = error ? 'Error fetching totals' : '';

  // Fetch nutrient breakdown (lipids/vitamins) via nutrient_totals_by_food + nutrition_details
  const foodsFetchKey = shouldFetch
    ? `${apiUrl}/api/meal_related/nutrient_totals_by_food?start=${startDate}&end=${effectiveEndDate}`
    : null;
  const { data: foodsData } = useSWR(foodsFetchKey, fetcher, { revalidateOnFocus: false });
  const [nutritionDetails, setNutritionDetails] = useState<{ per100g: Record<string, number>; lipidCols: string[]; vitaminCols: string[] } | null>(null);
  const [nutritionDetailsLoading, setNutritionDetailsLoading] = useState(false);

  useEffect(() => {
    const foods: any[] = foodsData?.totals || [];
    if (foods.length === 0) { setNutritionDetails(null); return; }
    setNutritionDetailsLoading(true);
    axios.post('/api/recipe_related/nutrition_details', {
      details: foods.map((f: any) => ({ desc1: f.desc1, desc2: f.desc2, portion: f.portion })),
    })
      .then(res => setNutritionDetails(res.data))
      .catch(() => setNutritionDetails(null))
      .finally(() => setNutritionDetailsLoading(false));
  }, [foodsData]);

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'inline-block' }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>
      <h2>Totals by Date Range - today's date is default end date, but modify if you want</h2>
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
      {loading && <div>Loading...</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
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
      {(totals ?? []).length === 0 && !loading && <div>No totals found for this range.</div>}

      {/* Lipids & Vitamins breakdown */}
      {nutritionDetailsLoading && <div style={{ marginTop: 16 }}>Loading nutrition details...</div>}
      {!nutritionDetailsLoading && nutritionDetails && (() => {
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
        const foods: any[] = foodsData?.totals || [];
        const totalPortion = foods.reduce((sum: number, f: any) => sum + (Number(f.portion) || 0), 0);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : new Date();
        const numDays = start ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1) : 1;
        const renderSection = (title: string, cols: string[]) => (
          <div style={{ marginBottom: '1em' }}>
            <h4 style={{ color: '#f7c1c1', margin: '0 0 4px 0' }}>{title}</h4>
            <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', width: 320 }}>
              <thead>
                <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                  <th style={{ textAlign: 'left', padding: '4px 12px' }}>Nutrient</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>Avg/Day</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>% DV</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, i) => {
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
          <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', marginTop: '1.5em', display: 'flex', gap: '2em', flexWrap: 'wrap' }}>
            {renderSection('Lipids & Minerals', nutritionDetails.lipidCols)}
            {renderSection('Vitamins', nutritionDetails.vitaminCols)}
          </div>
        );
      })()}
    </div>
  );
}
