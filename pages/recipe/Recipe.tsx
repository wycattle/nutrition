import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IRecipex, IOption } from '../../types/interfaces';
import Recipe_View from './recipe-view';

function Recipes() {
  const [selectedValue, setSelectedValue]   = useState<IOption | null>(null);
  const [options, setOptions]               = useState<IOption[]>([]);
  const [recipes, setRecipes]               = useState<IRecipex[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<IRecipex | null>(null);

  useEffect(() => {
    axios.get<IRecipex[]>('/api/recipe_related/view_recipes')
      .then(response => {
        setRecipes(response.data || []);
        const uniqueValues = response.data.map(recipe => recipe.name);
        setOptions(uniqueValues.map(value => ({ label: value, value })));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedValue) {
      const selectedRecipe = recipes.find(recipe => recipe.name === selectedValue.value);
      setSelectedRecipe(selectedRecipe || null);
    }
  }, [selectedValue, recipes]);

  return (
    <Recipe_View
      options={options}
      selectedValue={selectedValue}
      setSelectedValue={setSelectedValue}
      selectedRecipe={selectedRecipe}
    />
  );
}

export default Recipes;