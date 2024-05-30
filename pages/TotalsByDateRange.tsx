// pages/TotalsByDateRange.tsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { DailyTotals, TotalsSum } from '../lib/meal.types';
import Link from 'next/link';

const TotalMeals = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [totals, setTotals] = useState<DailyTotals[]>([]);   //This initializes the totals state variable as an empty array of MealTotal objects
  const [totalSum, setTotalSum] = useState<TotalsSum> //These params refer to the type defs
  ({
    total_portion:  0,
    total_calories: 0,
    total_carbs:    0,
    total_fat:      0,
    total_protein:  0,
    total_fiber:    0
  });
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => 
    {
    

    console.log('xx1  Totals state changed:', totals);

    let sum = {total_portion: 0, total_calories: 0, total_carbs: 0, total_fat: 0, total_protein: 0, total_fiber: 0};
    totals.forEach(total => {
      sum.total_portion   += total.total_portion;
      sum.total_calories  += total.total_calories;
      sum.total_carbs     += total.total_carbs;
      sum.total_fat       += total.total_fat;
      sum.total_protein   += total.total_protein;
      sum.total_fiber     += total.total_fiber;
    });
    setTotalSum(sum);
  }, [totals]);

  const fetchTotals = () => {

    console.log('xxx 2 Fetching totals...');

    axios.get('/api/meal_related/get_totals_by_date_range', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
    .then(response => {   
      const data = response.data.map((item: any) => ({
        ...item,
        day: new Date(item.day).toISOString(),    //this converts  Date back to string day
      }));
      console.log('clientside:  Received data from server:', response.data);
      console.log("frontend: converted data", data)
      setTotals(data);


    })
    .catch(error => {
      console.error('Error fetching totals:', error);
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {  // Check if code is running on client side
      fetchTotals();
    }
  }, []);

  // if (!hasFetched) { return null;}  // Don't render anything until fetchTotals has completed

  return (
    
    
  <div>
    <div id='back to home page' style={{padding:'30px'}} >
      <Link href="/"> {}
        <a style={{
          margin: '25px',
          border: "1px solid #000",
          borderRadius: '10px',
          backgroundColor:"#d6b5b5",
          padding: '10px'
        }}> Back to Home Page </a>
      </Link>
    </div>

    <div>
      <div style={{
          width: '25vw',
           margin: '25px',
           border: "1px solid #c4aaaa",
           borderRadius: '10px',
           backgroundColor:"#d6b5b5",
           padding: '10px',
           textAlign: 'center'
        }}>
          <label style={{
            margin: '25px',
            border: "1px solid #c4aaaa",
            borderRadius:'10px',
            backgroundColor:"#ebc8c8",
            padding: '10px',
            textAlign: 'center'
          }}>  Start date   </label>
        <DatePicker 
        selected={startDate} 
        onChange={(date: Date) => setStartDate(date)} />
      </div>

      <div style={{
           margin: '25px',
           border: "1px solid #c4aaaa",
           borderRadius:'10px',
           backgroundColor:"#d6b5b5",
           padding: '10px'
        }}>     <label style={{
          margin: '25px',
          border: "1px solid #c4aaaa",
          borderRadius:'10px',
          backgroundColor:"#ebc8c8",
          padding: '10px',
          textAlign: 'center'
        }}>End date   </label>
        <DatePicker 
        selected={endDate} 
        onChange={(date: Date) => setEndDate(date)} 
      /></div>

      <button onClick={fetchTotals} style = {{
        margin: '25px',
        border: "1px solid #c4aaaa",
        borderRadius:'10px',
        backgroundColor:"#d6b5b5",
        padding: '10px'

      }}>Fetch Totals</button>




      <div style={{
        padding:'0px',
        border: "1px solid #c4aaaa",
        borderRadius:'10px',
        backgroundColor:"#d6b5b5"
      }}>
        <table id='fetch-totals' style={{
          width: '60vw',
          margin: '25px',
          padding:'25px',
          tableLayout: 'fixed'
        }}>
          <thead id='fetch-totals-header' style={{
              margin: '10px',
              border: "1px solid #c4aaaa",
              borderRadius:'10px',
              backgroundColor:"#d6b5b5",
              padding: '10px',
              textAlign: 'right'
          }}>
            <tr style={{margin:'10px'}}>
              <th>Date</th>
              <th>Portion (g)</th>
              <th>Calories</th>
              <th>Carb</th>
              <th>Fat</th>
              <th>Protein</th>
              <th>Fiber</th>
            </tr>
          </thead>

          <tbody id='display-table'>
            {totals.map((total, index) => (
              <tr key={index}  
              style={{textAlign: 'right', padding:'10px', margin:'10px'}}>
                <td>{new Date(total.day).toLocaleDateString()}</td>
                <td >{Math.round(total.total_portion * 100)}</td>
                <td >{Math.ceil(total.total_calories)}</td>
                <td >{Math.ceil(total.total_carbs)}</td>
                <td >{Math.ceil(total.total_fat)}</td>
                <td >{Math.ceil(total.total_protein)}</td>
                <td >{Math.ceil(total.total_fiber)}</td>
              </tr>
            ))}

              <tr  
              style={{textAlign: 'right',
                  padding:'10px'
              }}>
                <td >Average/day</td>
                <td >{Math.round((totalSum.total_portion  / totals.length) * 100)}</td>
                <td >{Math.ceil((totalSum.total_calories  / totals.length))}</td>
                <td >{Math.ceil((totalSum.total_carbs     / totals.length))}</td>
                <td >{Math.ceil((totalSum.total_fat       / totals.length))}</td>
                <td >{Math.ceil((totalSum.total_protein   / totals.length))}</td>
                <td >{Math.ceil((totalSum.total_fiber     / totals.length))}</td>
              </tr>





          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default TotalMeals;