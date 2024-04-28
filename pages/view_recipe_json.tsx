// pages/view_recipe_json.tsx

import React, { useEffect, useState } from 'react';

type Recipe = {
  name: string;
  date: string;
  items: any[];
};

const ViewRecipeJson: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedItem, setSelectedItem] = useState<Recipe | null>(null);

  useEffect(() => {
    // Fetch recipes.json
    fetch('lib/recipes.json')
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error('Error fetching recipes.json:', error));
  }, []);

  const handleSelectItem = (item: Recipe) => {
    setSelectedItem(item);
  };

  return (
    <div>
      <h1>Recipes</h1>
      {recipes.map((recipe, index) => (
        <div key={index}>
          <span>{recipe.name}</span>
          <button onClick={() => handleSelectItem(recipe)}>Select</button>
        </div>
      ))}

      {selectedItem && (
        <div>
          <h1>Selected Recipe</h1>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ViewRecipeJson;