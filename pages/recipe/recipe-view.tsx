
import React, { useEffect, useState } from 'react';
import Select from 'react-dropdown-select';
import Link from 'next/link';
import { IOption, IRecipex, IMealDetail } from '../../types_interfaces/interfaces';
import axios from 'axios';
import styles from '../../styles/recipes.module.scss';
import { calculatePer100g } from '../../utils/methods';
import fs from 'fs';
import path from 'path';

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
}) => {
  const [editRows, setEditRows] = useState<IMealDetail[]>([]);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [totals, setTotals] = useState({
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });
  const [message, setMessage] = useState('');
  const [per100g, setPer100g] = useState({
    caloriesPer100g: 0,
    carbPer100g: 0,
    fatPer100g: 0,
    proteinPer100g: 0,
    fiberPer100g: 0,
  });

  // When recipe changes, reset editRows and checkedRows
  useEffect(() => {
    if (selectedRecipe) {
      setEditRows(selectedRecipe.details.map(row => ({ ...row })));
      setCheckedRows(new Set(selectedRecipe.details.map((_, i) => i)));
    } else {
      setEditRows([]);
      setCheckedRows(new Set());
    }
  }, [selectedRecipe]);

  // Recalculate totals when editRows or checkedRows change
  useEffect(() => {
    const filtered = editRows.filter((_, i) => checkedRows.has(i));
    const newTotals = filtered.reduce((acc, curr) => ({
      portionTot: acc.portionTot + (curr.portion ?? 0),
      caloriesTot: acc.caloriesTot + (curr.calories ?? 0),
      carbTot: acc.carbTot + (curr.carb ?? 0),
      fatTot: acc.fatTot + (curr.fat ?? 0),
      proteinTot: acc.proteinTot + (curr.protein ?? 0),
      fiberTot: acc.fiberTot + (curr.fiber ?? 0),
    }), {
      portionTot: 0,
      caloriesTot: 0,
      carbTot: 0,
      fatTot: 0,
      proteinTot: 0,
      fiberTot: 0,
    });
    setTotals(newTotals);
    setPer100g(calculatePer100g(newTotals));
  }, [editRows, checkedRows]);

  const handleCheckbox = (idx: number) => {
    setCheckedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  const handlePortionChange = (idx: number, value: string) => {
    const portion = parseFloat(value);
    setEditRows(prev => prev.map((row, i) =>
      i === idx
        ? {
            ...row,
            portion: isNaN(portion) ? 0 : portion,
            calories: (selectedRecipe?.details[idx].calories || 0) / (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            carb: (selectedRecipe?.details[idx].carb || 0) / (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            fat: (selectedRecipe?.details[idx].fat || 0) / (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            protein: (selectedRecipe?.details[idx].protein || 0) / (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            fiber: (selectedRecipe?.details[idx].fiber || 0) / (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
          }
        : row
    ));
  };

  const handleSave = async () => {
    if (!selectedRecipe) return;
    try {
      const updatedRecipe = {
        ...selectedRecipe,
        details: editRows.filter((_, i) => checkedRows.has(i)),
      };
      await axios.post('/api/recipe_related/recipes', updatedRecipe);
      setMessage('Recipe saved!');

      // Save per100g values to a JSON file (recipe_per100g.json)
      const per100gData = {
        name: selectedRecipe.name,
        ...per100g
      };

      // Call API to save per100gData (since fs is not available in browser)
      await axios.post('/api/recipe_related/recipe_per100g', per100gData);
    } catch (err) {
      setMessage('Error saving recipe.');
    }
  };

  return (
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
                <th></th>
                <th className='text-left'>Desc 1</th>
                <th className='text-left'>Desc 2</th>
                <th className='text-right'>Portion</th>
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
              {editRows.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={checkedRows.has(index)}
                      onChange={() => handleCheckbox(index)}
                    />
                  </td>
                  <td className='text-left'>{item.desc1}</td>
                  <td className='text-left'>{item.desc2}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.portion ?? ''}
                      onChange={e => handlePortionChange(index, e.target.value)}
                      style={{ width: '60px' }}
                    />
                  </td>
                  <td>{Math.round(item.calories || 0)}</td>
                  <td>{Math.round(item.carb || 0)}</td>
                  <td>{Math.round(item.fat || 0)}</td>
                  <td>{Math.round(item.protein || 0)}</td>
                  <td>{Math.round(item.fiber || 0)}</td>
                  <td>{item.GI ?? ''}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1em' }}>
            <button onClick={handleSave}>Save</button>
            <span style={{ marginLeft: '1em', color: 'green' }}>{message}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5em', marginTop: '1.5em' }}>
            <div>
              <h3 style={{ textAlign: 'center' }}>Totals</h3>
              <table className={styles['totals-table']}>
                <thead>
                  <tr>
                    <th>Portion</th>
                    <th>Calories</th>
                    <th>Carb</th>
                    <th>Fat</th>
                    <th>Protein</th>
                    <th>Fiber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{totals.portionTot.toFixed(2)}</td>
                    <td>{Math.round(totals.caloriesTot)}</td>
                    <td>{Math.round(totals.carbTot)}</td>
                    <td>{Math.round(totals.fatTot)}</td>
                    <td>{Math.round(totals.proteinTot)}</td>
                    <td>{Math.round(totals.fiberTot)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 style={{ textAlign: 'center' }}>Per 100g</h3>
              <table className={styles['totals-table']}>
                <thead>
                  <tr>
                    <th>100g</th>
                    <th>Calories</th>
                    <th>Carb</th>
                    <th>Fat</th>
                    <th>Protein</th>
                    <th>Fiber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>100g</td>
                    <td>{Math.round(per100g.caloriesPer100g)}</td>
                    <td>{Math.round(per100g.carbPer100g)}</td>
                    <td>{Math.round(per100g.fatPer100g)}</td>
                    <td>{Math.round(per100g.proteinPer100g)}</td>
                    <td>{Math.round(per100g.fiberPer100g)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipe_View;