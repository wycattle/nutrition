// pages/Meal.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import axios from 'axios';

import { IOption , IRecipex, IMealDetail, IMealx, IDailyTotalx  } from '../../types/interfaces';

import Meal_View from './Meal_View';


const Meal = () => {
  const [dropdownSelectedValue, setDropdownSelectedValue]         = useState< IOption | null>(null);
  const [selectedRow, setSelectedRow]             = useState< IMealDetail | null>(null);
  const [selectedRows, setSelectedRows]           = useState< IMealDetail[]>([]);
  const [dropdownOptions, setDropdownOptions]     = useState< IOption[] >([]);
  
  const [data, setData]                           = useState< IMealDetail[]>([]);
  const [portionSize, setPortionSize]             = useState< number>(0);
  const [dropdownCheckedRows, setDropdownCheckedRows]         = useState< Set<number>>(new Set());

  const [isBlinking, setIsBlinking] = useState(false);
  
  const [namex, setName]                           = useState< string>('');
  const [message, setMessage]                     = useState< string>('');
  const[totals, setTotals]                        = useState(
    {
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });

  //useEffect is a React Hook that lets you synchronize a component with an external system
  // fetch nutritionData from the '/api/nutrition' endpoint
  // the axios.get('/api/nutrition') call works because Next.js automatically maps API routes under the api directory to endpoints accessible via /api/<filename>.
  useEffect(() => {
    const url = '/api/nutrition';
    console.log('Fetching data from:', url);
    axios.get(url)
      .then(response => {
        setData(response.data || []);

        // create the dropdown for foodgroups
        const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, response.data));
        const dropdownOptions = R.map((value: string) => ({ label: value, value }), uniqueValues);
        setDropdownOptions(dropdownOptions);
      })
      .catch(error => {
        console.error('Error fetching data:', error.message || error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      });
  }, []);
  
// choose a foodgroup from the dropdown
  useEffect(() => {
    if (dropdownSelectedValue) {
      const selectedRow = data.find(item => item.desc1 === dropdownSelectedValue.value);
      setSelectedRow(selectedRow || null);
    }
  }, [dropdownSelectedValue, data]
);

//create total row
  useEffect(() => {
    if (selectedRows.length > 0) {
      handleCreateTotals({ details: selectedRows }); 
    }
  }, [selectedRows]);


  useEffect(() => {
    if (dropdownCheckedRows.size > 0) {
      setIsBlinking(true);
    }
  }, [dropdownCheckedRows]);



  const handleRowSelect = (row: IMealDetail) => {
    setSelectedRow(row);
  };


  /*Updates the selected row with the specified portion size and recalculates the nutritional values.   
  */
  const handleApplyPortion = () => {
    if (selectedRow) {
      const updatedRow = {
        ...selectedRow,
        portion: portionSize,
        calories: (selectedRow.calories   || 0) * portionSize,
        carb: (selectedRow.carb           || 0) * portionSize,
        fat: (selectedRow.fat             || 0) * portionSize,
        protein: (selectedRow.protein     || 0) * portionSize,
        fiber: (selectedRow.fiber         || 0) * portionSize,
      };
      setSelectedRow(updatedRow);
      setSelectedRows(prevRows => [...prevRows, updatedRow]);
      setDropdownCheckedRows(new Set());
      setIsBlinking(false);
    }};



  const handleCreateTotals = (mealData: { details: IMealDetail[]}) => {
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


  const handleCheckboxChange = (index: number) => {
    setSelectedRows((prevRows: IMealDetail[]) => 
      prevRows.filter((_, rowIndex) => 
        rowIndex !== index));
  };



// used below in saveasRecipe
  const [showNameInput, setShowNameInput] = useState(false);


// save as meal
  const handleSaveAsMeal = () => {
    setShowNameInput(false);
    const mealDetails: IMealDetail[] = selectedRows.map(row => ({
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
  
    const mealx: IMealx = {
      date: new Date,
      timestamp:new Date().toISOString(),
      details: mealDetails,
    };


    axios.post('/api/meal_related/meals', mealx)
      .then(response =>{
        if (response.data?.totals) {
          setTotals(response.data.totals);
      }
      setMessage('Meal created successfully');
    })
      .catch(error => 
        {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      });
  };



// save as recipe
const handleSaveAsRecipe = () => {
  setShowNameInput(true);
  if (!namex.trim()) {
    setMessage('Please enter a name for the recipe.');
    return;
  }
  const recipeDetails: IMealDetail[] = selectedRows.map(row => ({
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

  const newRecipe: IRecipex = {
    name: namex,
    details: recipeDetails,
  };

  axios.post('/api/recipe_related/recipes', newRecipe)
    .then(response => {
      setMessage(response.data.message || 'Recipe created successfully');
      setSelectedRows([]);
    })
    .catch(error => {
      if (axios.isAxiosError(error)) {
        setMessage(error.message);
      } else {
        setMessage('An error occurred');
      }
    });
};
  // Render the presentational component and pass all necessary props
  return (
    <Meal_View
      dropdownOptions={dropdownOptions}
      dropdownSelectedValue={dropdownSelectedValue}
      setDropdownSelectedValue={setDropdownSelectedValue}
      data={data}
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
      showNameInput={showNameInput}
      namex={namex}
      setName={setName}
      handleSaveAsMeal={handleSaveAsMeal}
      handleSaveAsRecipe={handleSaveAsRecipe}
      message={message}
    />
  );
};

export default Meal;