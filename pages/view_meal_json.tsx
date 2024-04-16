import React, { useEffect, useState } from 'react';

type Meal = {
  name: string;
  date: string;
  items: any[];
};

const ViewMealJson: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedItem, setSelectedItem] = useState<Meal | null>(null);

  useEffect(() => {
    // Fetch meal.json
    fetch('/view_meal.json')
      .then((response) => response.json())
      .then((data) => setMeals(data))
      .catch((error) => console.error('Error fetching meal.json:', error));
  }, []);

  const handleSelectItem = (item: Meal) => {
    setSelectedItem(item);
  };

  return (
    <div>
      <h1>Meals</h1>
      {meals.map((meal, index) => (
        <div key={index}>
          <span>{meal.date}</span>
          <button onClick={() => handleSelectItem(meal)}>Select</button>
        </div>
      ))}

      {selectedItem && (
        <div>
          <h1>Selected Meal</h1>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ViewMealJson;