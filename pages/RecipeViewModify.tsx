
// pages/service/RecipeViewModify.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import axios from 'axios';
import { IRecipe, Option } from './interfaces';
import Link from 'next/link';

function RecipeViewModify() {
  const [selectedValue, setSelectedValue]   = useState<Option | null>(null);
  const [options, setOptions]               = useState<Option[]>([]);
  const [recipes, setRecipes]               = useState<IRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<IRecipe | null>(null);

  useEffect(() => {
    axios.get<IRecipe[]>('/api/recipe_related/view_recipes')
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
    <div>
      <div id='back to home page'>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
      </div>

      <Select
        options={options}
        onChange={( value ) => setSelectedValue(value[0] || null)}
        placeholder="Select a recipe"
        values={[]}
      />
{selectedRecipe && (
        <div>
          <h2>{selectedRecipe.name}</h2>
          <table>
            <thead>
              <tr>
                <th className='text-left'>Desc 1</th>
                <th className='text-left'>Desc 2</th>
                <th className='text-right'>Portion(g) </th>
                <th className='text-right'>Calories</th>
                <th className='text-right'>Carb</th>
                <th className='text-right'>Fat</th>
                <th className='text-right'>Protein</th>
                <th className='text-right'>Fiber</th>
                <th className='text-right'>GI</th>
                <th className='text-right'>Note</th>

              </tr>
            </thead>
            <tbody>
              {selectedRecipe.items.map((item, index) => (
                <tr key={index}>
                  <td className='text-left'>{(item.desc_1)}</td>
                  <td className='text-left'>{(item.desc_2)}</td>
                  <td>{((item.portion || 0)) *100}</td>
                  <td>{Math.round(item.calories || 0)}</td>
                  <td>{Math.round(item.protein || 0)}</td>
                  <td>{Math.round(item.fat || 0)}</td>
                  <td>{Math.round(item.carb || 0)}</td>
                  <td>{Math.round(item.fiber || 0)}</td>
                  <td>{Math.round(item.GI ||0) || 0}</td>
                  <td>{(item.note)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecipeViewModify;