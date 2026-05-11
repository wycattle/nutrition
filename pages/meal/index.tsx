
/**
 * pages/meal/index.tsx
 * Meal creation and management page for my_nutrition_app
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as R from 'ramda';
import axios from 'axios';

import { IOption, IRecipex, IMealDetail, IMealx, IDailyMealTotalx } from '../../types_interfaces/interfaces';
import { fetcher, defaultSwrOptions } from '../../utils/swrHelper';
import styles from '../../styles/Meal_styles.module.scss';
import Spinner from '../../utils/Spinner';
import useSWR, { mutate } from 'swr';

// Main Meal component: handles all UI state and logic for meal creation
const Meal = () => {
  // Ref for the portion size input (for focusing)
  const focusPortionInputRef = React.useRef<HTMLInputElement>(null);

  const [dropdownSelectedValue, setDropdownSelectedValue] = useState<IOption | null>(null);
  // Currently selected row (food item)
  const [selectedRow, setSelectedRow] = useState<IMealDetail | null>(null);
  // All selected rows (food items added to meal)
  const [selectedRows, setSelectedRows] = useState<IMealDetail[]>([]);
  // Dropdown options for food groups
  const [dropdownOptions, setDropdownOptions] = useState<IOption[]>([]);
  // All nutrition data comes from SWR (nutritionData)
  // Portion size input
  const [portionSize, setPortionSize] = useState<number>(0);
  // Tracks which rows are checked in the dropdown table
  const [dropdownCheckedRows, setDropdownCheckedRows] = useState<Set<number>>(new Set());
  // UI state for blinking effect on portion input
  const [isBlinking, setIsBlinking] = useState(false);
  // Name input for recipe
  const [namex, setName] = useState<string>('');
  // Message for user feedback
  const [message, setMessage] = useState<string>('');
  // Totals for the current meal (portion, calories, etc.)
  const [totals, setTotals] = useState({
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });

  // Category dropdown state for recipes
  const [categoryOptions, setCategoryOptions] = useState<IOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Nutrition search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IMealDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/nutrition_search?search_word=${encodeURIComponent(searchTerm)}`);
      setSearchResults(res.data);
    } catch (err) {
      setSearchResults([]);
      setMessage('No results or error searching.');
      setTimeout(() => setMessage(''), 1500);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch available recipe categories from API
  useEffect(() => {
    // console.time('categories-fetch');
    axios.get('/api/recipe_related/categories')
      .then(res => {
        // console.timeEnd('categories-fetch');
        // Map API response to dropdown options
        const options = (res.data || []).map((cat: any) => ({ label: cat.name, value: cat.name }));
        // console.time('categories-set');
        setCategoryOptions(options);
      })
      .catch(() => {
        setCategoryOptions([]); // No fallback, just empty
      });
  }, []);

  // Log when categories are rendered (for debugging/timing)
  // Removed effect that logs and sets state to avoid update depth errors

  // Use shared SWR options for robust data freshness
  const { data: nutritionData = [], error: nutritionError } = useSWR(
    '/api/nutrition',
    fetcher,
    defaultSwrOptions
  );

  // When nutrition data loads, build dropdown options for food groups
  useEffect(() => {
    const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, nutritionData));
    const dropdownOptions = R.map((value: string) => ({ label: value, value }), uniqueValues);

    setDropdownOptions(prev => {
      const prevLabels = prev.map(opt => opt.label).join(',');
      const newLabels = dropdownOptions.map(opt => opt.label).join(',');
      if (prevLabels === newLabels) return prev;
      return dropdownOptions;
    });
  }, [nutritionData]);

  // When a food group is selected, set the selected row (first item in group)
  useEffect(() => {
    if (dropdownSelectedValue) {
      const groupRows = nutritionData.filter((item: IMealDetail) => item.desc1 === dropdownSelectedValue.value);
      const selectedRow = groupRows[0];
      setSelectedRow(selectedRow || null);
    }
  }, [dropdownSelectedValue, nutritionData]);

  // When selectedRows changes, recalculate totals for the meal
  useEffect(() => {
    if (selectedRows.length > 0) {
      handleCreateTotals({ details: selectedRows });
    }
  }, [selectedRows]);

  // If any row is checked, trigger blinking effect on portion input
  useEffect(() => {
    if (dropdownCheckedRows.size > 0) {
      setIsBlinking(true);
    }
  }, [dropdownCheckedRows]);

  // Handler: set selected row when a food item is clicked
  const handleRowSelect = (row: IMealDetail) => {
    setSelectedRow(row);
  };

  // Handler: apply portion size to selected row and add to meal
  const handleApplyPortion = () => {
    if (selectedRow) {
      const updatedRow = {
        ...selectedRow,
        portion: portionSize,
        calories: (selectedRow.calories || 0) * portionSize,
        carb: (selectedRow.carb || 0) * portionSize,
        fat: (selectedRow.fat || 0) * portionSize,
        protein: (selectedRow.protein || 0) * portionSize,
        fiber: (selectedRow.fiber || 0) * portionSize,
      };
      setSelectedRow(updatedRow);
      setSelectedRows(prevRows => [...prevRows, updatedRow]);
      setDropdownCheckedRows(new Set());
      setIsBlinking(false);
      setPortionSize(0); // Reset the input to default after entry
      // Focus the input after resetting
      setTimeout(() => {
        const input = document.getElementById('portionSize') as HTMLInputElement | null;
        if (input) input.focus();
      }, 0);
    }
  };

  // Calculate totals for the meal (sum of all selected rows)
  const handleCreateTotals = (mealData: { details: IMealDetail[] }) => {
    const newTotals = mealData.details.reduce((acc, curr) => ({
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
  };

  // Calculate calories by nutrient class (carb, fat, protein) using static multipliers
  const nonProteinCalories = (totalsObj: {
    carbTot: number;
    fatTot: number;
    proteinTot: number;
  }) => {
    // Multipliers: carb: 4.5, fat: 9.5, protein: 0
    const carbCalories = (totalsObj.carbTot ?? 0) * 4.5;
    const fatCalories = (totalsObj.fatTot ?? 0) * 9.5;
    const proteinCalories = (totalsObj.proteinTot ?? 0) * 0;
    const grandTotal = carbCalories + fatCalories; // protein always 0
    return {
      carbCalories,
      fatCalories,
      proteinCalories,
      grandTotal,
    };
  };

  // Calculate nutrient calories for the current totals
  const nutrientCalories = nonProteinCalories(totals);

  // Handler: remove a selected row from the meal
  const handleCheckboxChange = (index: number) => {
    setSelectedRows((prevRows: IMealDetail[]) =>
      prevRows.filter((_, rowIndex) => rowIndex !== index));
  };

  // UI state for showing name input and date picker
  const [showNameInput, setShowNameInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmSaveButton, setShowConfirmSaveButton] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [meal_recipeDate, setMeal_recipeDate] = useState<Date | null>(null);

  // Handler: save the current meal to the database
  // Step 1: Show date picker when Save as Meal is clicked
  const handleSaveAsMeal = () => {
    setShowNameInput(false);
    if (!showDatePicker) {
      setShowDatePicker(true);
      setShowConfirmSaveButton(false);
      return;
    }
    // If date picker is already shown, do nothing (wait for user to pick date)
  };

  // Step 2: When user picks a date, show confirm button
  useEffect(() => {
    if (showDatePicker && meal_recipeDate) {
      setShowConfirmSaveButton(true);
    } else {
      setShowConfirmSaveButton(false);
    }
  }, [showDatePicker, meal_recipeDate]);

  // Step 3: Confirm and save meal
  const handleConfirmSaveMeal = () => {
    if (!meal_recipeDate) {
      setMessage('Please pick a date for the meal.');
      return;
    }
    setIsSavingMeal(true);
    // Build meal details from selected rows
    const mealDetails: IMealDetail[] = (selectedRows ?? []).map(row => ({
      desc1: row.desc1,
      desc2: row.desc2,
      portion: row.portion,
      calories: row.calories,
      carb: row.carb,
      fat: row.fat,
      protein: row.protein,
      fiber: row.fiber,
      GI: row.GI,
      note: row.note,
    }));
    // Build meal object for API
    // Use local date parts to avoid UTC offset shifting the date (e.g. UTC+7 midnight → previous UTC day)
    const localDate = [
      meal_recipeDate.getFullYear(),
      String(meal_recipeDate.getMonth() + 1).padStart(2, '0'),
      String(meal_recipeDate.getDate()).padStart(2, '0'),
    ].join('-');
    const mealx: IMealx = {
      date: localDate,
      timestamp: meal_recipeDate.toISOString(),
      details: mealDetails,
    };
    axios.post('/api/meal_related/meals', mealx)
      .then(response => {
        if (response.data?.totals) {
          setTotals(response.data.totals);
        }
        setMessage('Meal created successfully');
        setShowDatePicker(false);
        setMeal_recipeDate(null);
        setSelectedRows([]); // Clear meal table after save
        setDropdownSelectedValue(null); // Clear food item table after save
        setTotals({
          portionTot: 0,
          caloriesTot: 0,
          carbTot: 0,
          fatTot: 0,
          proteinTot: 0,
          fiberTot: 0,
        }); // Clear non-protein nutrient calories after save
        setTimeout(() => setMessage(''), 1500);
      })
      .catch(error => {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      })
      .finally(() => {
        setIsSavingMeal(false);
        setShowConfirmSaveButton(false);
      });
  };

  // Handler: save the current selection as a recipe
  const handleSaveAsRecipe = () => {
    // First click: show the name + category inputs, don't try to save yet
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    // Validate name and category
    if (!namex.trim()) {
      setMessage('Enter a name for the recipe.');
      return;
    }
    if (!selectedCategory) {
      setMessage('Please select a category for the recipe.');
      return;
    }

    // Build recipe details from selected rows
    const recipeDetails: IMealDetail[] = (selectedRows ?? []).map(row => ({
      desc1: row.desc1,
      desc2: row.desc2,
      portion: row.portion,
      calories: row.calories,
      carb: row.carb,
      fat: row.fat,
      protein: row.protein,
      fiber: row.fiber,
      GI: row.GI,
      note: row.note,
    }));

    // Build recipe object for API
    const newRecipe: IRecipex = {
      name: namex,
      details: recipeDetails,
      category: selectedCategory,
    };

    // Save recipe to API
    axios.post('/api/recipe_related/recipes', newRecipe)
      .then(() => {
        setMessage('Recipe saved!');
        setSelectedRows([]);
        setShowNameInput(false);
        setShowDatePicker(false);
        setName('');
        setSelectedCategory('');
        setMeal_recipeDate(null);
        mutate('/api/nutrition'); // Force SWR to revalidate nutrition data
      })
      .catch(error => {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      });
  };

  const safeNutrientCalories = nutrientCalories ?? { carbCalories: 0, fatCalories: 0, proteinCalories: 0, grandTotal: 0 };
  const safeSearchResults = searchResults ?? [];
  const safeSelectedRows = selectedRows ?? [];
  const safeCategoryOptions = categoryOptions ?? [];

  return (
  <div className={styles['page-root']}>
    <div style={{ display: 'inline-block' }}>
      <Link href="/">
        <span className="globalButton">Back to Home Page</span>
      </Link>
    </div>

    {/* Controls Row: food group dropdown and search box */}
    <div style={{ display: 'flex', alignItems: 'center', width: '100vw', maxWidth: '100vw', margin: '1.5em auto 0', boxSizing: 'border-box', padding: '0 2vw' }}>
      <div className={styles['select-food-group-container']} style={{ flex: '0 0 420px', minWidth: 320 }}>
        <label htmlFor="select-food-group-item">
          Select a food group
        </label>
        <div id="select-food-group-item">
          <Select
            options={dropdownOptions}
            onChange={(newValue) => {
              setDropdownSelectedValue(newValue[0]);
            }}
            placeholder='Click here . . .'
            values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
            dropdownHeight="auto"
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginLeft: '2vw', flex: 1 }}>
        <label htmlFor="nutrition-search-box" style={{ marginRight: 4 }}>
          search the nutrition table
        </label>
        <input
          id="nutrition-search-box"
          type="text"
          placeholder="type & press Enter..."
          value={searchTerm || ''}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          style={{ minWidth: 180 }}
        />
        {isSearching && <Spinner />}
        {!isSearching && searchTerm?.trim() && safeSearchResults.length === 0 && (
          <span style={{ color: '#ed5b5b', fontSize: '0.85em' }}>
            Item not found
          </span>
        )}
        {!isSearching && safeSearchResults.length > 0 && (
          <span style={{ color: '#07efc8', fontSize: '0.85em' }}>
            {safeSearchResults.length} result{safeSearchResults.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>

    {/* Search results table: always full width, below controls row */}
    {safeSearchResults.length > 0 && (
      <div
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw',
          maxWidth: '100vw',
          minWidth: 600,
          margin: '2em -50vw',
          border: '2px solid #07efc8',
          borderRadius: 12,
          background: '#23272b',
          boxShadow: '0 2px 8px rgba(44,68,66,0.12)',
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            fontSize: '0.95em',
            borderCollapse: 'collapse',
            width: '100%',
            tableLayout: 'fixed',
            minWidth: '100%',
          }}
        >
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '85%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '2px solid #ed5b5b', color: '#52e87a' }}>
              <th style={{ padding: '0.3em 0.6em', textAlign: 'left' }}>Desc 1</th>
              <th
                style={{
                  padding: '0.3em 0.6em',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Desc 2
              </th>
            </tr>
          </thead>
          <tbody>
            {safeSearchResults.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #725e5e' }}>
                <td style={{ padding: '0.3em 0.6em', textAlign: 'left' }}>{item.desc1}</td>
                <td
                  style={{
                    padding: '0.3em 0.6em',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.desc2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {dropdownSelectedValue && (
      <div
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw',
          maxWidth: '100vw',
          minWidth: 600,
          margin: '2em -50vw',
          overflowX: 'auto',
        }}
      >
        <table
          id="meal_table"
          className={styles['table-style']}
          style={{
            fontSize: '0.95em',
            borderCollapse: 'collapse',
            width: '60%',
            tableLayout: 'fixed',
            minWidth: '60%',
          }}
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead className={styles['table-style']}>
            <tr>
              <th style={{ textAlign: 'left' }}>Select</th>
              <th style={{ textAlign: 'left' }}>Desc 1</th>
              <th style={{ textAlign: 'left' }}>Desc 2</th>
              <th style={{ textAlign: 'right' }}>Portion</th>
              <th style={{ textAlign: 'right' }}>Calories</th>
              <th style={{ textAlign: 'right' }}>Carb</th>
              <th style={{ textAlign: 'right' }}>Fat</th>
              <th style={{ textAlign: 'right' }}>Protein</th>
              <th style={{ textAlign: 'right' }}>Fiber</th>
            </tr>
          </thead>
          <tbody>
            {nutritionData.filter((item: IMealDetail) => item.desc1 === dropdownSelectedValue?.value)
              .sort((a: IMealDetail, b: IMealDetail) => (a.desc2 ?? '').localeCompare(b.desc2 ?? ''))
              .map((item: IMealDetail, index: number) => (
              <tr key={index}>
                <td style={{ textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(2)" }}
                    checked={dropdownCheckedRows.has(index)}
                    onChange={() => {
                      handleRowSelect(item);
                      if (dropdownCheckedRows.has(index)) {
                        dropdownCheckedRows.delete(index);
                      } else {
                        dropdownCheckedRows.add(index);
                        setTimeout(() => {
                          if (focusPortionInputRef.current) {
                            focusPortionInputRef.current.focus();
                          }
                        }, 0);
                      }
                      setDropdownCheckedRows(new Set(dropdownCheckedRows));
                    }}
                  />
                </td>
                <td style={{ textAlign: 'left' }}>{item.desc1}</td>
                <td style={{ textAlign: 'left' }}>{item.desc2}</td>
                <td style={{ textAlign: 'right' }}>{item.portion}</td>
                <td style={{ textAlign: 'right' }}>{item.calories}</td>
                <td style={{ textAlign: 'right' }}>{item.carb}</td>
                <td style={{ textAlign: 'right' }}>{item.fat}</td>
                <td style={{ textAlign: 'right' }}>{item.protein}</td>
                <td style={{ textAlign: 'right' }}>{item.fiber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div className={styles['portion-container']} style={{ margin: '20px 0 20px 5vw' }}>
      <label
        htmlFor="portionSize"
        className={isBlinking ? styles['blink'] : ''}
      >
        enter a portion size number and click Enter (1=100g)
      </label>
      <input
        id="portionSize"
        ref={focusPortionInputRef}
        className={`${styles['portion-size-inputbox']} ${isBlinking ? styles['blink'] : ''}`}
        type="number"
        placeholder=""
        onFocus={(e) => { e.target.select(); }}
        value={portionSize === 0 ? '' : portionSize}
        onChange={(e) => setPortionSize(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleApplyPortion();
          }
        }}
      />
    </div>

    <h2 className={styles.h2}>Selected Rows (check box to delete)</h2>
    <div
      style={{
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        width: '100vw',
        maxWidth: '100vw',
        minWidth: 600,
        margin: '2em -50vw',
        overflowX: 'auto',
      }}
    >
      <table className={styles['table-style']} style={{ fontSize: '0.95em', borderCollapse: 'collapse', width: '60%', tableLayout: 'fixed', minWidth: '60%' }}>
        <colgroup>
          <col style={{ width: '5%' }} /> {/* Remove */}
          <col style={{ width: '10%' }} /> {/* Desc1 */}
          <col style={{ width: '15%' }} /> {/* Desc2 */}
          <col style={{ width: '5%' }} /> {/* Portion */}
          <col style={{ width: '8%' }} /> {/* Calories */}
          <col style={{ width: '8%' }} /> {/* Carb */}
          <col style={{ width: '8%' }} /> {/* Fat */}
          <col style={{ width: '8%' }} /> {/* Protein */}
          <col style={{ width: '8%' }} /> {/* Fiber */}
        </colgroup>
        <thead className={styles['table-style']}>
          <tr>
            <th style={{ textAlign: 'left' }}>Remove</th>
            <th style={{ textAlign: 'left' }}>Desc 1</th>
            <th style={{ textAlign: 'left' }}>Desc 2</th>
            <th style={{ textAlign: 'right' }}>Portion</th>
            <th style={{ textAlign: 'right' }}>Calories</th>
            <th style={{ textAlign: 'right' }}>Carb</th>
            <th style={{ textAlign: 'right' }}>Fat</th>
            <th style={{ textAlign: 'right' }}>Protein</th>
            <th style={{ textAlign: 'right' }}>Fiber</th>
          </tr>
        </thead>
        <tbody className={styles['table-style']}>
          {safeSelectedRows.map((item, index) => (
            <tr key={index} style={{ height: '32px', background: index % 2 === 0 ? '#23272b' : '#1f2226' }}>
              <td style={{ textAlign: 'center', border: '1px solid #000', background: 'inherit' }}>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td style={{ textAlign: 'left', border: '1px solid #000', background: 'inherit' }}>{item.desc1}</td>
              <td style={{ textAlign: 'left', border: '1px solid #000', background: 'inherit' }}>{item.desc2}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.portion}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.calories}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.carb}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.fat}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.protein}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.fiber}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr>
            <td style={{ border: '1px solid #000', background: 'inherit' }}>Totals</td>
            <td style={{ border: '1px solid #000', background: 'inherit' }}></td>
            <td style={{ border: '1px solid #000', background: 'inherit' }}></td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.portionTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.caloriesTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.carbTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.fatTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.proteinTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.fiberTot}</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Nutrient Calories separate container */}
    <h2 className={styles.h2}>Non-protein nutrient calories</h2>
    <div className={styles['nutrient-calories-container']} style={{ marginTop: '1.5em', marginBottom: '1.5em' }}>
      <div style={{ display: 'flex', gap: '2em', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Nutrient Calories</span>
        <span>total non_protein cals: {safeNutrientCalories.grandTotal.toFixed(1)}</span>
        <span>Carb: {safeNutrientCalories.carbCalories.toFixed(1)}</span>
        <span>Fat: {safeNutrientCalories.fatCalories.toFixed(1)}</span>
        {/* <span>Protein: {safeNutrientCalories.proteinCalories.toFixed(1)}</span> */}
      </div>
    </div>
    {safeSelectedRows.length > 0 && (
      <>
        {/* Only show name and category input for recipe */}
        {showNameInput && (
          <div className={styles['name-it-box']}>
            <label htmlFor="nameItBox">Give it a name:</label>
            <input
              id="nameItBox"
              className={styles['name-it-box-inputStyle']}
              type="text"
              value={namex}
              onChange={e => setName(e.target.value)}
              placeholder="fill me in"
            />
            <div style={{ marginTop: '0.5em' }}>
              <label>Category:</label>
              <Select
                options={safeCategoryOptions}
                onChange={vals => setSelectedCategory(vals[0]?.value || '')}
                placeholder="Select category"
                values={selectedCategory ? [{ label: selectedCategory, value: selectedCategory }] : []}
                style={{ width: '200px', marginTop: '0.25em' }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Save as Meal button, then show date picker */}
        <div style={{ marginTop: '1em' }}>
          <button
            id="saveAsMealButton"
            className="globalButton"
            onClick={handleSaveAsMeal}
            disabled={isSavingMeal}
          >
            Save as Meal?
          </button>
        </div>
        {showDatePicker && (
          <div style={{ marginTop: '0.75em' }}>
            <label>Pick a date for the meal:&nbsp;</label>
            <DatePicker
              selected={meal_recipeDate}
              onChange={(date: Date | null) => setMeal_recipeDate(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Pick a date"
              isClearable
              disabled={isSavingMeal}
            />
          </div>
        )}
        {/* Step 2: Confirm Save button appears after date is picked */}
        {showConfirmSaveButton && !isSavingMeal && (
          <div style={{ marginTop: '1em' }}>
            <button
              id="confirmSaveMealButton"
              className="globalButton"
              onClick={handleConfirmSaveMeal}
            >
              Confirm Save Meal
            </button>
          </div>
        )}
        {/* Spinner while saving */}
        {isSavingMeal && <Spinner />}

        <div>
          <button
            id="saveAsRecipeButton"
            className="globalButton"
            onClick={handleSaveAsRecipe}
          >
            Save as Recipe
          </button>
        </div>
      </>
    )}

    {message && <div className={styles['alert-popup2']}>{message}</div>}
  </div>
  );
};

export default Meal;