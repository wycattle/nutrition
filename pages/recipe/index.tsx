/**
 * pages/recipe/index.tsx
 * Recipe selection and view page for my_nutrition_app
 */

import React, { useState } from 'react';
import useSWR from 'swr';
import { IRecipex, IOption } from '../../types_interfaces/interfaces';
import Recipe_View from './recipe-view';
import { fetcher } from '../../utils/helper';

function Recipes() {
  const [selectedValue, setSelectedValue] = useState<IOption | null>(null);
  // Use shared fetcher utility for SWR data fetching
  const { data: recipes = [], error } = useSWR<IRecipex[]>('/api/recipe_related/recipes', fetcher);

  const options: IOption[] = (recipes || []).map(recipe => ({ label: recipe.name, value: recipe.name }));
  const selectedRecipe = selectedValue ? recipes.find(r => r.name === selectedValue.value) || null : null;

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