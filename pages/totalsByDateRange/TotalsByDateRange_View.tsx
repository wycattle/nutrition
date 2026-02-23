import React from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TotalsByDateRange_View_Props {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  fetchTotals: () => void;
  totals: any[];
  loading: boolean;
  error: string;
}

const TotalsByDateRange_View: React.FC<TotalsByDateRange_View_Props> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  fetchTotals,
  totals,
  loading,
  error,
}) => {
  // Convert string dates to Date objects for DatePicker
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>
      <h2>Totals by Date Range</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: 8 }}>
          Start Date:
          <DatePicker
            selected={startDateObj}
            onChange={date => setStartDate(date ? date.toISOString().slice(0, 10) : '')}
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
            onChange={date => setEndDate(date ? date.toISOString().slice(0, 10) : '')}
            dateFormat="yyyy-MM-dd"
            minDate={startDateObj || undefined}
            placeholderText="Select end date"
            isClearable
          />
        </label>
        <button onClick={fetchTotals} style={{ marginLeft: 16 }}>Fetch Totals</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {totals.length > 0 && (
        <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Calories</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Fiber</th>
              <th>Portion</th>
              <th>Protein</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((row: any) => (
              <tr key={row.timestamp || row.date}>
                <td>{row.date}</td>
                <td>{row.caloriesTot}</td>
                <td>{row.carbTot}</td>
                <td>{row.fatTot}</td>
                <td>{row.fiberTot}</td>
                <td>{row.portionTot}</td>
                <td>{row.proteinTot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totals.length === 0 && !loading && <div>No totals found for this range.</div>}
    </div>
  );
};

export default TotalsByDateRange_View;
