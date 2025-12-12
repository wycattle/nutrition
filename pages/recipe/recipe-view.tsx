
import React from 'react';
import Select from 'react-dropdown-select';
import Link from 'next/link';
import { IOption, IRecipex } from '../../types/interfaces';

interface RecipeViewProps {
  options: IOption[];
  selectedValue: IOption | null;
  setSelectedValue: (value: IOption | null) => void;
  selectedRecipe: IRecipex | null;
}

const Recipe_View: React.FC<RecipeViewProps> = ({
  options,
  selectedValue,
  setSelectedValue,
  selectedRecipe,
}) => (
  <div>
    <div id='back to home page'>
      <Link href="/">
        <span> Back to Home Page </span>
      </Link>
    </div>

    <Select
      options={options}
      onChange={(value) => setSelectedValue(value[0] || null)}
      placeholder="Select a recipe"
      values={selectedValue ? [selectedValue] : []}
    />

    {selectedRecipe && (
      <div>
        <h2>{selectedRecipe.name}</h2>
        <table>
          <thead>
            <tr>
              <th className='text-left'>Desc 1</th>
              <th className='text-left'>Desc 2</th>
              <th className='text-right'>Portion(g)</th>
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
                <td className='text-left'>{item.desc_1}</td>
                <td className='text-left'>{item.desc_2}</td>
                <td>{((item.portion || 0)) * 100}</td>
                <td>{Math.round(item.calories || 0)}</td>
                <td>{Math.round(item.protein || 0)}</td>
                <td>{Math.round(item.fat || 0)}</td>
                <td>{Math.round(item.carb || 0)}</td>
                <td>{Math.round(item.fiber || 0)}</td>
                <td>{Math.round(item.GI || 0) || 0}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default Recipe_View;