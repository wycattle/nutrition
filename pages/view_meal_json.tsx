//pages/view_meal_json.tsx

import React, { useState, useEffect } from 'react';
// import fs from 'fs';
// import path from 'path';

interface Item {
    desc_1:   string;
    desc_2:   string;
    portion:  number | undefined;
    calories: number | undefined;
    carb:     number | undefined;
    fat:      number | undefined;
    protein:  number | undefined;
    fiber:    number | undefined;
    GI:       number | undefined;
    note:     string;       
  }

  interface Meal {
    name: string;
    date: Date;
    items: Item[];
  }


  const ViewMealJson = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  
    useEffect(() => {
      fetch('/api/getMeals')
        .then(response => response.json())
        .then(data => setMeals(data));
    }, []);

  const handleSelectMeal = (meal:Meal) => {
    setSelectedMeal(meal);
  };

  const handleSaveMeal = (meal: Meal) => {
    fetch('/api/updateMeal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meal),
    })
      .then(response => response.json())
      .then(() => {
        const updatedMeals = meals.map((m: Meal) => m.name === meal.name ? meal : m);
        setMeals(updatedMeals);
        setSelectedMeal(null);
      });
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {meals.map(Meal => (
            <tr key={Meal.name}>
              <td><input type="checkbox" onChange={() => handleSelectMeal(Meal)} /></td>
              <td>{Meal.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedMeal && (
        <div>
          <table>
            {/* Render table with full details of selectedMeal */}
          </table>
          <button onClick={() => handleSaveMeal(selectedMeal)}>Save</button>
        </div>
      )}
    </div>
  );
};

export default ViewMealJson;