// pages/totalsByDate.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import Link from 'next/link';
import 'react-datepicker/dist/react-datepicker.css';
import { DailyTotal } from './interfaces';

const Home = () => {
  const [startDate3, setStartDate3] = useState(new Date());
  const [endDate3, setEndDate3] = useState(new Date());
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);

  const fetchDailyTotals = async () => {
    // Format dates to "YYYY-MM-DD" before sending
    const startDate = startDate3.toISOString().split('T')[0];
    const endDate = endDate3.toISOString().split('T')[0];

    const { data } = await axios.get('/api/meal_related/dailyTotals', {
      params: { 
        startDate, // This uses the formatted startDate
        endDate // This uses the formatted endDate
      },
    });
    setDailyTotals(data);
  };

  return (
    <div>
            <div>
        <Link href="/"> {}
          <span  className='back-to-home-page'> Back to Home Page </span>
        </Link>
      </div>

      <h1>Daily Totals</h1>

        <label htmlFor="startDate">Start Date:</label>
        <DatePicker id="startDate" selected={startDate3} onChange={(date) => setStartDate3(date)} />
        <label htmlFor="endDate">End Date:</label>
        <DatePicker id="endDate" selected={endDate3} onChange={(date) => setEndDate3(date)} />
        <button onClick={fetchDailyTotals}>Fetch Daily Totals</button>
        
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Calories</th>
            <th>Carbs</th>
            <th>Fat</th>
            <th>Fiber</th>
            <th>Portion Weight</th>
            <th>Protein</th>
          </tr>
        </thead>
        <tbody>
          {dailyTotals.map((total) => (
            <tr key={total.id}>
              <td>{new Date(total.day).toLocaleDateString()}</td>
              <td>{total.calories}</td>
              <td>{total.carbs}</td>
              <td>{total.fat}</td>
              <td>{total.fiber}</td>
              <td>{total.portion_weight}</td>
              <td>{total.protein}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;