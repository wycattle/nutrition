//CreateMealInRange.tsx
import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';

const CreateMealsInRange = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [meals, setMeals] = useState<{ date: string; meals: string; calories: number; carb: number; fat: number; protein: number; fiber: number }[]>([]);
  const [totals, setTotals] = useState<{ calories: number; carb: number; fat: number; protein: number; fiber: number }>({ calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0 });
  
  
  const fetchMeals = useCallback(async () => {
    if (startDate && endDate) {
      const response = await fetch(`/api/meal_related/meals?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      if (!response.ok) {
        console.error(`Failed to fetch meals: ${response.statusText}`);
        return;
      }
      const mealsInRange = await response.json() as { date: string; meals: string; calories: number; carb: number; fat: number; protein: number; fiber: number }[];
      setMeals(mealsInRange);

      const totals = mealsInRange.reduce((total, meal) => ({
        calories: total.calories + meal.calories,
        carb: total.carb + meal.carb,
        fat: total.fat + meal.fat,
        protein: total.protein + meal.protein,
        fiber: total.fiber + meal.fiber
      }), { calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0 });

      setTotals(totals);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals, startDate, endDate]);


  return (
    <div>
      <div id='back to home page'>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
      </div>

      <h2>Pick a start date:</h2>
      <DatePicker selected={startDate} onChange={(newDate: Date) => {
  if (newDate.getTime() !== startDate.getTime()) {
    setStartDate(newDate);
  }
}} />

      <h2>Pick an end date:</h2>
      <DatePicker selected={endDate} onChange={(date: Date) => {
  if (date.getTime() !== endDate.getTime()) {
    setEndDate(date);
  }
}} />

{startDate && endDate && meals.length > 0 && meals.map((meal, index) => (
        <div key={index}>
          <p>{meal.date}: {meal.meals}</p>
          <p>Calories: {meal.calories}</p>
          <p>Carbs: {meal.carb}</p>
          <p>Fat: {meal.fat}</p>
          <p>Protein: {meal.protein}</p>
          <p>Fiber: {meal.fiber}</p>
          <p>Total calories: {totals.calories}</p>
          <p>Total carbs: {totals.carb}</p>
          <p>Total fat: {totals.fat}</p>
          <p>Total protein: {totals.protein}</p>
          <p>Total fiber: {totals.fiber}</p>
        </div>
      ))}

    </div>
  );
};

export default CreateMealsInRange;