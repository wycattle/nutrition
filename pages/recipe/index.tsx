/**
 * pages/recipe/index.tsx
 * Recipe page for my_nutrition_app
 */

import React, { useEffect, useState } from 'react';
import Select from 'react-dropdown-select';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import { IOption, IRecipex, IMealDetail } from '../../types_interfaces/interfaces';
import styles from '../../styles/recipes.module.scss';
import { calculatePer100g } from '../../utils/methods';
import { fetcher } from '../../utils/helper';
import Spinner from '../../utils/Spinner';

function Recipes() {
  // --- Data fetching ---
  const [selectedValue, setSelectedValue] = useState<IOption | null>(null);
  const { data: recipes = [], isLoading } = useSWR<IRecipex[]>('/api/recipe_related/recipes', fetcher);

  const options: IOption[] = (recipes || []).map(recipe => ({ label: recipe.name, value: recipe.name }));
  const selectedRecipe = selectedValue ? recipes.find(r => r.name === selectedValue.value) || null : null;

  // --- Edit state ---
  const [editRows   , setEditRows]    = useState<IMealDetail[]>([]);  //data source of the table
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [totals     , setTotals]      = useState({
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
      setEditRows(selectedRecipe.details.map(row => ({ ...row })));  //The spread { ...row } makes a shallow copy so edits don't mutate the original prop.
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
      portionTot:   acc.portionTot  + (curr.portion ?? 0),
      caloriesTot:  acc.caloriesTot + (curr.calories ?? 0),
      carbTot:      acc.carbTot     + (curr.carb ?? 0),
      fatTot:       acc.fatTot      + (curr.fat ?? 0),
      proteinTot:   acc.proteinTot  + (curr.protein ?? 0),
      fiberTot:     acc.fiberTot    + (curr.fiber ?? 0),
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

  // --- Handlers ---
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
            calories: (selectedRecipe?.details[idx].calories  || 0) /  (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            carb:     (selectedRecipe?.details[idx].carb      || 0) /  (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            fat:      (selectedRecipe?.details[idx].fat       || 0) /  (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            protein:  (selectedRecipe?.details[idx].protein   || 0) /  (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
            fiber:    (selectedRecipe?.details[idx].fiber     || 0) /  (selectedRecipe?.details[idx].portion || 1) * (isNaN(portion) ? 0 : portion),
          }
        : row
    ));
  };

  const handleCellChange = (idx: number, field: keyof IMealDetail, value: string) => {
    if (field === 'note' || field === 'desc1' || field === 'desc2') {
      setEditRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    } else {
      const numVal = parseFloat(value);
      setEditRows(prev => prev.map((row, i) =>
        i === idx ? { ...row, [field]: isNaN(numVal) ? undefined : numVal } : row
      ));
    }
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
    } catch (err) {
      setMessage('Error saving recipe.');
    }
  };

  // --- JSX ---
  return (
    <div>
      <div id='back to home page'>
        <Link href="/">
          <span> Back to Home Page </span>
        </Link>
      </div>

      <div style={{ marginLeft: '2em', marginTop: '1em', display: 'flex', alignItems: 'center', gap: '1em' }}>
        <Select
          options={options}
          onChange={(value) => setSelectedValue(value[0] || null)}
          placeholder={isLoading ? "Loading recipes..." : "Select a recipe"}
          values={selectedValue ? [selectedValue] : []}
          disabled={isLoading}
        />
        {isLoading && <Spinner size={24} />}
      </div>

      {selectedRecipe && (
        <div>
          <div style={{ marginLeft: '1em' }}>
            <table className={styles['table-style']}>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: 'left' }}>Desc 1</th>
                  <th style={{ textAlign: 'left' }}>Desc 2</th>
                  <th className='text-right'>Portion</th>
                  <th className='text-right'>Calories</th>
                  <th className='text-right'>Carb</th>
                  <th className='text-right'>Fat</th>
                  <th className='text-right'>Protein</th>
                  <th className='text-right'>Fiber</th>
                  <th className='text-right'>GI</th>
                  <th style={{ textAlign: 'left' }}>Note</th>
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
                    <td style={{ textAlign: 'left' }}>{item.desc1}</td>
                    <td style={{ textAlign: 'left' }}>{item.desc2}</td>
                    <td className='text-right'>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.portion ?? ''}
                        onChange={e => handlePortionChange(index, e.target.value)}
                        style={{ width: '60px', textAlign: 'center' }}
                        className="my-input-class"
                      />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="1"
                        value={item.calories !== undefined ? Math.round(item.calories) : ''}
                        onChange={e => handleCellChange(index, 'calories', e.target.value)}
                        style={{ width: '65px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="0.1"
                        value={item.carb !== undefined ? Number(item.carb.toFixed(1)) : ''}
                        onChange={e => handleCellChange(index, 'carb', e.target.value)}
                        style={{ width: '55px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="0.1"
                        value={item.fat !== undefined ? Number(item.fat.toFixed(1)) : ''}
                        onChange={e => handleCellChange(index, 'fat', e.target.value)}
                        style={{ width: '55px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="0.1"
                        value={item.protein !== undefined ? Number(item.protein.toFixed(1)) : ''}
                        onChange={e => handleCellChange(index, 'protein', e.target.value)}
                        style={{ width: '55px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="0.1"
                        value={item.fiber !== undefined ? Number(item.fiber.toFixed(1)) : ''}
                        onChange={e => handleCellChange(index, 'fiber', e.target.value)}
                        style={{ width: '55px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td className='text-right'>
                      <input type="number" min="0" step="1"
                        value={item.GI ?? ''}
                        onChange={e => handleCellChange(index, 'GI', e.target.value)}
                        style={{ width: '45px', textAlign: 'center' }} className="my-input-class" />
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <input type="text"
                        value={item.note ?? ''}
                        onChange={e => handleCellChange(index, 'note', e.target.value)}
                        style={{ width: '120px' }} className="my-input-class" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1em', marginLeft: '2em' }}>
            <button
              onClick={handleSave}
              style={{
                background: '#32232c',
                color: '#c6a3dd',
                border: '2px solid #725e5e',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              Save changes
            </button>
            {message && (
              <span style={{
                marginLeft: '1em',
                color: '#c6a3dd',
                background: '#32232c',
                borderRadius: '6px',
                padding: '4px 12px',
                border: '1px solid #725e5e',
              }}>{message}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5em', marginTop: '1.5em', marginLeft: '2em' }}>
            <div>
              <h3 style={{ textAlign: 'center' }}>Totals</h3>
              <table className={styles['totals-table']}>
                <tbody>
                  <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                    <th className='text-right'>Portion</th>
                    <th className='text-right'>Calories</th>
                    <th className='text-right'>Carb</th>
                    <th className='text-right'>Fat</th>
                    <th className='text-right'>Protein</th>
                    <th className='text-right'>Fiber</th>
                  </tr>
                  <tr style={{ background: '#32232c', color: '#c6a3dd' }}>
                    <td className='text-right'>{totals.portionTot.toFixed(2)}</td>
                    <td className='text-right'>{Math.round(totals.caloriesTot)}</td>
                    <td className='text-right'>{Math.round(totals.carbTot)}</td>
                    <td className='text-right'>{Math.round(totals.fatTot)}</td>
                    <td className='text-right'>{Math.round(totals.proteinTot)}</td>
                    <td className='text-right'>{Math.round(totals.fiberTot)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 style={{ textAlign: 'center' }}>Per 100g</h3>
              <table className={styles['totals-table']}>
                <tbody>
                  <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                    <th className='text-right'>100g</th>
                    <th className='text-right'>Calories</th>
                    <th className='text-right'>Carb</th>
                    <th className='text-right'>Fat</th>
                    <th className='text-right'>Protein</th>
                    <th className='text-right'>Fiber</th>
                  </tr>
                  <tr style={{ background: '#32232c', color: '#c6a3dd' }}>
                    <td className='text-right'>100g</td>
                    <td className='text-right'>{Math.round(per100g.caloriesPer100g)}</td>
                    <td className='text-right'>{Math.round(per100g.carbPer100g)}</td>
                    <td className='text-right'>{Math.round(per100g.fatPer100g)}</td>
                    <td className='text-right'>{Math.round(per100g.proteinPer100g)}</td>
                    <td className='text-right'>{Math.round(per100g.fiberPer100g)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;