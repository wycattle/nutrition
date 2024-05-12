// DatePickerTest.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';

const DatePickerTest = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

  return (
    <div>
<div id='back to home page'>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
    

      <h2>Pick a start date:</h2>
      <DatePicker selected={startDate} onChange={(newDate: Date) => setStartDate(newDate)} />

      <h2>Pick an end date:</h2>
      <DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />


    </div>
    </div>
  );
};

export default DatePickerTest;