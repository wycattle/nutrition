import React, { useState } from 'react';
import TotalsByDateRange_View from './TotalsByDateRange_View';

export default function TotalsByDateRange() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totals, setTotals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTotals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/meal_related/meal_totals_by_date?start=${startDate}&end=${endDate}`);
      if (!res.ok) throw new Error('Failed to fetch totals');
      const data = await res.json();
      setTotals(data.totals || []);
    } catch (err) {
      setError('Error fetching totals');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <TotalsByDateRange_View
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      fetchTotals={fetchTotals}
      totals={totals}
      loading={loading}
      error={error}
    />
  );
}
