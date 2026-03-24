
/**
 * pages/totalsByDateRange/TotalsByDateRange_View.tsx
 * View component for totals by date range
 */

import React from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Define the props interface for TotalsByDateRange_View
export interface TotalsByDateRangeViewProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchTotals: () => void;
  totals: any[];
  loading: boolean;
  error: string;
  hideHeaderAndControls?: boolean;
}

export const TotalsByDateRange_View: React.FC<TotalsByDateRangeViewProps> = ({
  startDate = '',
  endDate = '',
  setStartDate = () => {},
  setEndDate = () => {},
  fetchTotals = () => {},
  totals = [],
  loading = false,
  error = '',
  hideHeaderAndControls = false,
}) => {
  // Parse date strings to Date objects for DatePicker
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : new Date();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, position: 'relative' }}>
      {!hideHeaderAndControls && (
        <div style={{ position: 'absolute', top: 0, left: 0, margin: 0, zIndex: 10 }}>
          <Link href="/">
            <span className="globalButton">Back to Home Page</span>
          </Link>
        </div>
      )}
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
        <button onClick={fetchTotals} style={{ marginLeft: 16 }}>Fetch Totals</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
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
            {/*
              Only render rows where row.date is not 'Average'.
              This prevents the 'Average' summary row from appearing twice:
              - once in the main table body
              - and again as the styled summary row at the end.
              This is the most idiomatic ("pythonic") way in JS/React to filter out unwanted items before mapping.
            */}
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
    </div>
  );
};

// Add a default export for compatibility (could be the same as the named export)
export default TotalsByDateRange_View;
