
/**
 * pages/meal/index.tsx
 * Meal creation and management page for my_nutrition_app
 */
// Meal page container: manages all state, handlers, and data fetching for meal creation
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import useSWR from 'swr';
import axios from 'axios';


import { IOption , IRecipex, IMealDetail, IMealx, IDailyMealTotalx  } from '../../types_interfaces/interfaces';
import Meal_View from './Meal_View';
import { fetcher } from '../../utils/helper';

// Main Meal component: handles all UI state and logic for meal creation
const Meal = () => {
  // Dropdown state for food group selection
  // DEBUG: Log when component mounts
  React.useEffect(() => {
    // ...existing code...
  }, []);
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

  // Fetch nutrition data (all food items) from API using SWR and the shared fetcher utility
  const { data: nutritionData = [], error: nutritionError } = useSWR('/api/nutrition', fetcher);

  // When nutrition data loads, build dropdown options for food groups
  useEffect(() => {
    const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, nutritionData));
    const dropdownOptions = R.map((value: string) => ({ label: value, value }), uniqueValues);
    // Only update if different to avoid infinite loop
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
      })
      .catch(error => {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      });
  };

  // Render the presentational component and pass all state, handlers, and data as props
  return (
    <div>
      <Meal_View
        dropdownOptions={dropdownOptions}
        dropdownSelectedValue={dropdownSelectedValue}
        setDropdownSelectedValue={setDropdownSelectedValue}
        data={nutritionData}
        dropdownCheckedRows={dropdownCheckedRows}
        setDropdownCheckedRows={setDropdownCheckedRows}
        handleRowSelect={handleRowSelect}
        portionSize={portionSize}
        setPortionSize={setPortionSize}
        isBlinking={isBlinking}
        handleApplyPortion={handleApplyPortion}
        selectedRows={selectedRows}
        handleCheckboxChange={handleCheckboxChange}
        totals={totals}
        nutrientCalories={nutrientCalories}
        showNameInput={showNameInput}
        namex={namex}
        setName={setName}
        handleSaveAsMeal={handleSaveAsMeal}
        handleConfirmSaveMeal={handleConfirmSaveMeal}
        handleSaveAsRecipe={handleSaveAsRecipe}
        message={message}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showDatePicker={showDatePicker}
        showConfirmSaveButton={showConfirmSaveButton}
        isSavingMeal={isSavingMeal}
        recipeDate={meal_recipeDate}
        setRecipeDate={setMeal_recipeDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
      />
    </div>
  );
};

export default Meal;