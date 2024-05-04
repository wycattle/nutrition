//pages/api/view_recipe_json.tsx

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

  interface recipe {
    name: string;
    date: Date;
    items: Item[];
  }


  const ViewrecipeJson = () => {
    const [recipes, setrecipes] = useState<recipe[]>([]);
    const [selectedrecipe, setSelectedRecipe] = useState<recipe | null>(null);
  
    useEffect(() => {
      fetch('/api/getRecipes')
        .then(response => response.json())
        .then(data => setrecipes(data));
    }, []);

  const handleSelectrecipe = (recipe:recipe) => {
    setSelectedRecipe(recipe);
  };

    
  const handleDeleterecipe = (recipe: recipe) => {
    fetch('/api/deleteRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    })
    .then(response => response.json())
    .then(() => {
      const updatedrecipes = recipes.filter((m: recipe) => m.name !== recipe.name);
      setrecipes(updatedrecipes);
      setSelectedRecipe(null);
    });
  };

  const handlePortionChange = (itemIndex: number, newPortion: number) => {
    if (selectedrecipe) {
      const updatedItems = [...selectedrecipe.items];
      updatedItems[itemIndex].portion = newPortion;
      setSelectedRecipe({ ...selectedrecipe, items: updatedItems });
    }
  };

  const handleSaverecipe = (recipe: recipe) => {      //this section is indented indicating that 'save' comes after portion change
    fetch('/api/updateRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    })
      .then(response => response.json())
      .then(() => {
        const updatedrecipes = recipes.map((m: recipe) => m.name === recipe.name ? recipe : m);
        setrecipes(updatedrecipes);
        setSelectedRecipe(null);
      });
  };

  return (
    <div>
      
      <div>
        <Link href="/"> {}
          <a> Back to Home Page </a> {}
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Delete</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(recipe => (
            <tr key={recipe.name}>
              <td><input type="checkbox" onChange={() => handleSelectrecipe(recipe)} /></td>
              <td><input type="checkbox" onChange={() => handleDeleterecipe(recipe)} title="Delete" /></td>
              <td>{recipe.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

    {selectedrecipe && (
      <div>
        <h2>{selectedrecipe.name}</h2>
        <p>{selectedrecipe.date.toString()}</p>
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
            {selectedrecipe.items.map((item, index) => (
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
        <button onClick={() => handleSaverecipe(selectedrecipe)}>Save</button>
      </div>
    )}
  </div>
  );
};

export default ViewrecipeJson;