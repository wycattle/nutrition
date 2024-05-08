//pages/api/view_meal_json.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';


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

  
const handleDeleteMeal = (meal: Meal) => {
  fetch('/api/deleteMeal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meal),
  })
  .then(response => response.json())
  .then(() => {
    const updatedMeals = meals.filter((m: Meal) => m.name !== meal.name);
    setMeals(updatedMeals);
    setSelectedMeal(null);
  });
};

const handlePortionChange = (itemIndex: number, newPortion: number) => {
  if (selectedMeal) {
    const updatedItems = [...selectedMeal.items];
    updatedItems[itemIndex].portion = newPortion;
    setSelectedMeal({ ...selectedMeal, items: updatedItems });
  }
};

        const handleSaveMeal = (meal: Meal) => {      //this section is indented indicating that 'save' comes after portion change
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

      <div>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
      </div>


    <div>
      <table style={{ width: "45%", margin: '25px'}}>
        <thead style={{textAlign: 'left'}}>
          <tr>
            <th>Select</th>
            <th>Delete</th>
            <th style={{width: "50%"}}>Name</th>
          </tr>
        </thead>
        <tbody>
          {meals.map(Meal => (
            <tr key={Meal.name}>
              <td><input type="checkbox" onChange={() => handleSelectMeal(Meal)} /></td>
              <td><input type="checkbox" onChange={() => handleDeleteMeal(Meal)} title="Delete" /></td>
              <td>{Meal.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

    {selectedMeal && (
      <div>
        <h2>{selectedMeal.name}</h2>
        <p>{selectedMeal.date.toString()}</p>
        <table>
          <thead>
            <tr>
              <th>Description 1</th>
              <th>Description 2</th>
              <th>Portion</th>
              <th>Calories</th>
              <th>Carb</th>
              <th>Fat</th>
              <th>Protein</th>
              <th>Fiber</th>
              <th>GI</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {selectedMeal.items.map((item, index) => (
              <tr key={index}>
                <td>{item.desc_1}</td>
                <td>{item.desc_2}</td>
                <td>
                  <input
                    type="number"
                    value={item.portion}
                    onChange={(e) => handlePortionChange(index, Number(e.target.value))}
                    />
                </td>
                <td>{item.calories}</td>
                <td>{item.carb}</td>
                <td>{item.fat}</td>
                <td>{item.protein}</td>
                <td>{item.fiber}</td>
                <td>{item.GI}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => handleSaveMeal(selectedMeal)}>Save</button>
      </div>
    )}
  </div>
  </div>
  );
};

export default ViewMealJson;