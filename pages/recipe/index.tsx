/**
 * pages/recipe/index.tsx
 * Recipe page for my_nutrition_app
 */

import React, { useEffect, useRef, useState } from 'react';
import * as R from 'ramda';
import Select from 'react-dropdown-select';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import { IOption, IRecipex, IMealDetail } from '../../types_interfaces/interfaces';
import styles from '../../styles/recipes.module.scss';
import { calculatePer100g } from '../../utils/methods';
import { fetcher, defaultSwrOptions } from '../../utils/swrHelper';
import Spinner from '../../utils/Spinner';
import { RDA } from '../../utils/rda';

function Recipes() {
  // --- Data fetching ---
  const [selectedValue, setSelectedValue] = useState<IOption | null>(null);
  const { data: recipes = [], isLoading } = useSWR<IRecipex[]>('/api/recipe_related/recipes', fetcher, defaultSwrOptions);

  const options: IOption[] = (recipes || []).map(recipe => ({ label: recipe.name, value: recipe.name }));
  const selectedRecipe = selectedValue ? recipes.find(r => r.name === selectedValue.value) || null : null;

  // --- Edit state ---
  const [editRows, setEditRows] = useState<IMealDetail[]>([]);  //data source of the table
  const [totals     , setTotals]      = useState({
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });
  const [recipeName, setRecipeName] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [recipeCategory, setRecipeCategory] = useState<string>('');
  const [nutritionDetails, setNutritionDetails] = useState<{ per100g: Record<string, number>; lipidCols: string[]; vitaminCols: string[] } | null>(null);
  const [nutritionDetailsLoading, setNutritionDetailsLoading] = useState(false);

  // --- Food lookup panel state (for Add Row) ---
  const { data: nutritionData = [] } = useSWR<IMealDetail[]>('/api/nutrition', fetcher, defaultSwrOptions);
  const [showFoodLookup, setShowFoodLookup] = useState(false);
  const [foodGroupOptions, setFoodGroupOptions] = useState<IOption[]>([]);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<IOption | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<IMealDetail | null>(null);
  const [lookupPortion, setLookupPortion] = useState<number>(0);
  const portionInputRef = useRef<HTMLInputElement>(null);

  // Build food group dropdown options from nutrition data
  useEffect(() => {
    if (nutritionData.length === 0) return;
    const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, nutritionData)) as string[];
    setFoodGroupOptions(uniqueValues.map(v => ({ label: v, value: v })));
  }, [nutritionData]);

  // Fetch categories for recipe-level category selector
  useEffect(() => {
    axios.get('/api/recipe_related/categories')
      .then(res => setCategories((res.data || []).map((c: { name: string }) => c.name)))
      .catch(() => setCategories([]));
  }, []);
  const [per100g, setPer100g] = useState({
    caloriesPer100g: 0,
    carbPer100g: 0,
    fatPer100g: 0,
    proteinPer100g: 0,
    fiberPer100g: 0,
  });

  // When recipe changes, reset editRows, checkedRows, recipeCategory, and recipeName
  useEffect(() => {
    if (selectedRecipe) {
      setEditRows(selectedRecipe.details.map(row => ({ ...row })));  //The spread { ...row } makes a shallow copy so edits don't mutate the original prop.
      setRecipeCategory(selectedRecipe.category ?? '');
      setRecipeName(selectedRecipe.name ?? '');
    } else {
      setEditRows([]);
      setRecipeCategory('');
      setRecipeName('');
    }
  }, [selectedRecipe]);

  // Auto-fetch nutrition details when editRows change
  useEffect(() => {
    if (editRows.length === 0) { setNutritionDetails(null); return; }
    setNutritionDetailsLoading(true);
    axios.post('/api/recipe_related/nutrition_details', {
      details: editRows.map(r => ({ desc1: r.desc1, desc2: r.desc2, portion: r.portion })),
    })
      .then(res => setNutritionDetails(res.data))
      .catch(() => setNutritionDetails(null))
      .finally(() => setNutritionDetailsLoading(false));
  }, [editRows]);

  // Recalculate totals when editRows change
  useEffect(() => {
    const newTotals = editRows.reduce((acc, curr) => ({
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
  }, [editRows]);

  // --- Handlers ---
  const handleDeleteRow = (idx: number) => {
    setEditRows(prev => prev.filter((_, i) => i !== idx));
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

  const handleAddRow = () => {
    setShowFoodLookup(true);
    setSelectedFoodGroup(null);
    setSelectedFoodItem(null);
    setLookupPortion(0);
  };

  const handleFoodLookupSelect = (item: IMealDetail) => {
    setSelectedFoodItem(item);
    setLookupPortion(0);
    setTimeout(() => { if (portionInputRef.current) portionInputRef.current.focus(); }, 0);
  };

  const handleFoodLookupAdd = () => {
    if (!selectedFoodItem) return;
    const portion = lookupPortion || 0;
    const newRow: IMealDetail = {
      ...selectedFoodItem,
      portion,
      calories: (selectedFoodItem.calories || 0) * portion,
      carb:     (selectedFoodItem.carb     || 0) * portion,
      fat:      (selectedFoodItem.fat      || 0) * portion,
      protein:  (selectedFoodItem.protein  || 0) * portion,
      fiber:    (selectedFoodItem.fiber    || 0) * portion,
    };
    setEditRows(prev => [...prev, newRow]);
    // Reset for another pick
    setSelectedFoodItem(null);
    setLookupPortion(0);
  };

  const handleFoodLookupClose = () => {
    setShowFoodLookup(false);
    setSelectedFoodGroup(null);
    setSelectedFoodItem(null);
    setLookupPortion(0);
  };

  const handleSave = async () => {
    if (!selectedRecipe) return;
    if (!recipeName.trim()) { setMessage('Recipe name cannot be empty.'); return; }
    setIsSaving(true);
    try {
      const updatedRecipe = {
        ...selectedRecipe,
        name: recipeName.trim(),
        category: recipeCategory,
        details: editRows,
      };
      await axios.post('/api/recipe_related/recipes', updatedRecipe);
      setMessage('Recipe saved!');
    } catch (err) {
      setMessage('Error saving recipe.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX ---
  return (
    <div style={{ padding: '1em 4em' }}>
      <div style={{ display: 'inline-block' }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>

      <div style={{ marginTop: '1em', display: 'flex', alignItems: 'center', gap: '1em' }}>
        <Select
          options={options}
          onChange={(value) => setSelectedValue(value[0] || null)}
          placeholder={isLoading ? "Loading recipes..." : "Select a recipe"}
          values={selectedValue ? [selectedValue] : []}
          disabled={isLoading}
        />
        {isLoading && <Spinner size={24} />}
        {selectedRecipe && (
          <>
            <label style={{ color: '#c6a3dd', fontSize: '14px' }}>Category:</label>
            <select
              value={recipeCategory}
              onChange={e => setRecipeCategory(e.target.value)}
              className="my-input-class"
              style={{ minWidth: '100px' }}
            >
              <option value="">-- select --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {selectedRecipe && (
        <div>
          <div>
            <table className={styles['table-style']}>
              <thead>
                <tr>
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
                  <th style={{ textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {editRows.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'left' }}>{item.desc1}</td>
                    <td style={{ textAlign: 'left' }}>
                      <input type="text"
                        value={item.desc2 ?? ''}
                        onChange={e => handleCellChange(index, 'desc2', e.target.value)}
                        style={{ width: '160px' }} className="my-input-class" />
                    </td>
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
                    <td>
                      <button
                        onClick={() => handleDeleteRow(index)}
                        title="Delete row"
                        style={{ background: 'transparent', color: '#f7c1c1', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.5em' }}>
            <button
              onClick={handleAddRow}
              style={{
                background: '#32232c',
                color: '#c6a3dd',
                border: '2px solid #725e5e',
                borderRadius: '10px',
                padding: '6px 18px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              + Add Row
            </button>
          </div>

          {/* Food lookup panel */}
          {showFoodLookup && (
            <div style={{ marginTop: '1em', border: '2px solid #725e5e', borderRadius: '10px', padding: '1em', background: '#23272b', maxWidth: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75em' }}>
                <span style={{ color: '#c6a3dd', fontWeight: 'bold' }}>Select food to add</span>
                <button onClick={handleFoodLookupClose} style={{ background: 'transparent', color: '#f7c1c1', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ marginBottom: '0.75em' }}>
                <label style={{ color: '#c6a3dd', fontSize: '14px', marginRight: '0.5em' }}>Food group:</label>
                <div style={{ display: 'inline-block', minWidth: '300px' }}>
                  <Select
                    options={foodGroupOptions}
                    onChange={val => { setSelectedFoodGroup(val[0] || null); setSelectedFoodItem(null); setLookupPortion(0); }}
                    placeholder="Select a food group..."
                    values={selectedFoodGroup ? [selectedFoodGroup] : []}
                    dropdownHeight="auto"
                  />
                </div>
              </div>

              {selectedFoodGroup && (
                <div style={{ overflowX: 'auto', marginBottom: '0.75em' }}>
                  <table className={styles['table-style']} style={{ fontSize: '0.9em', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Desc 2</th>
                        <th className='text-right'>Portion</th>
                        <th className='text-right'>Cal</th>
                        <th className='text-right'>Carb</th>
                        <th className='text-right'>Fat</th>
                        <th className='text-right'>Protein</th>
                        <th className='text-right'>Fiber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutritionData
                        .filter((item: IMealDetail) => item.desc1 === selectedFoodGroup.value)
                        .sort((a: IMealDetail, b: IMealDetail) => (a.desc2 ?? '').localeCompare(b.desc2 ?? ''))
                        .map((item: IMealDetail, idx: number) => (
                          <tr
                            key={idx}
                            onClick={() => handleFoodLookupSelect(item)}
                            style={{
                              cursor: 'pointer',
                              background: selectedFoodItem?.desc2 === item.desc2 && selectedFoodItem?.desc1 === item.desc1 ? '#3b4144' : undefined,
                            }}
                          >
                            <td style={{ textAlign: 'left' }}>{item.desc2}</td>
                            <td className='text-right'>{item.portion}</td>
                            <td className='text-right'>{item.calories}</td>
                            <td className='text-right'>{item.carb}</td>
                            <td className='text-right'>{item.fat}</td>
                            <td className='text-right'>{item.protein}</td>
                            <td className='text-right'>{item.fiber}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedFoodItem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginTop: '0.5em' }}>
                  <span style={{ color: '#c6a3dd', fontSize: '14px' }}>{selectedFoodItem.desc2}</span>
                  <label style={{ color: '#c6a3dd', fontSize: '14px' }}>Portion (1=100g):</label>
                  <input
                    ref={portionInputRef}
                    type="number"
                    min="0"
                    step="0.01"
                    value={lookupPortion === 0 ? '' : lookupPortion}
                    onChange={e => setLookupPortion(parseFloat(e.target.value) || 0)}
                    onKeyDown={e => { if (e.key === 'Enter') handleFoodLookupAdd(); }}
                    style={{ width: '70px', textAlign: 'center' }}
                    className="my-input-class"
                  />
                  <button
                    onClick={handleFoodLookupAdd}
                    style={{ background: '#32232c', color: '#c6a3dd', border: '2px solid #725e5e', borderRadius: '8px', padding: '4px 14px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '1em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexWrap: 'wrap' }}>
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
              Save changes as
            </button>
            <input
              type="text"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              style={{ minWidth: '200px', fontSize: '16px' }}
              className="my-input-class"
              placeholder="Recipe name"
            />
          </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginTop: '0.5em' }}>
            {isSaving && <Spinner size={24} />}
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5em', marginTop: '1.5em' }}>
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
            {nutritionDetailsLoading && <div style={{ marginTop: 8 }}><Spinner size={20} /></div>}
            {!nutritionDetailsLoading && nutritionDetails && (() => {
              const LABELS: Record<string, string> = {
                omega3: 'Omega-3 (g)', omega6: 'Omega-6 (g)', cholesterol_mg: 'Cholesterol (mg)',
                sodium_mg: 'Sodium (mg)', potassium_mg: 'Potassium (mg)', calcium_mg: 'Calcium (mg)',
                iron_mg: 'Iron (mg)', magnesium_mg: 'Magnesium (mg)', iodine_mcg: 'Iodine (mcg)',
                manganese_mg: 'Manganese (mg)', selenium_mcg: 'Selenium (mcg)', zinc_mg: 'Zinc (mg)',
                vit_a_mcg: 'Vitamin A (mcg)', vit_b1_mg: 'Vitamin B1 (mg)', vit_b2_mg: 'Vitamin B2 (mg)',
                vit_b3_mg: 'Vitamin B3 (mg)', vit_b5_mg: 'Vitamin B5 (mg)', vit_b6_mg: 'Vitamin B6 (mg)',
                vit_b12_mcg: 'Vitamin B12 (mcg)', biotin_mcg: 'Biotin (mcg)', choline_mg: 'Choline (mg)',
                folate_mcg: 'Folate (mcg)', vit_c_mg: 'Vitamin C (mg)', vit_d_mcg: 'Vitamin D (mcg)',
                vit_e_mg: 'Vitamin E (mg)', vit_k_mcg: 'Vitamin K (mcg)',
              };

              const renderSection = (title: string, cols: string[]) => (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ textAlign: 'center', color: '#f7c1c1', marginBottom: 4 }}>{title}</h4>
                  <table className={styles['totals-table']} style={{ minWidth: 160, width: 320, margin: '0 auto' }}>
                    <thead>
                      <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                        <th style={{ textAlign: 'left', padding: '4px 12px' }}>Nutrient</th>
                        <th style={{ textAlign: 'right', padding: '4px 12px' }}>Per 100g</th>
                        <th style={{ textAlign: 'right', padding: '4px 12px' }}>% RDA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cols.map((col, i) => {
                        const val = nutritionDetails.per100g[col];
                        const rda = RDA[col];
                        const pct = val && rda ? Math.round((val / rda) * 100) : null;
                        return (
                          <tr key={col} style={{ background: i % 2 === 0 ? '#32232c' : '#3b2d36', color: '#c6a3dd' }}>
                            <td style={{ textAlign: 'left', padding: '3px 12px' }}>{LABELS[col] ?? col}</td>
                            <td style={{ textAlign: 'right', padding: '3px 12px' }}>
                              {val === 0 ? '—' : val}
                            </td>
                            <td style={{ textAlign: 'right', padding: '3px 12px' }}>
                              {pct !== null ? `${pct}%` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
              return (
                <div style={{ marginTop: 8 }}>
                  {renderSection('Lipids & Minerals', nutritionDetails.lipidCols)}
                  {renderSection('Vitamins', nutritionDetails.vitaminCols)}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;