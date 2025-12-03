// pages/createMeal.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import axios from 'axios';

import { IOption , IRecipeDetail, IRecipex, IMealDetail, IMealx  } from './interfaces';
import Link from 'next/link';
import styles from '../styles/createMeal_styles.module.scss';


const CreateMeal = () => {
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

  useEffect(() => {
    if (selectedRows.length > 0) {
      handleCreateTotals({ details: selectedRows }); // Adjust according to the expected structure
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






// used below in saveasMeal/recipe
  const [showNameInput, setShowNameInput] = useState(false);



  const handleSaveAsMeal = () => {
    setShowNameInput(true);
    if (!namex.trim()) {
      setMessage('Please enter a name for the meal.');
      return;
    }
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
      name: namex,
      date: new Date,
      details: mealDetails,
    };


  axios.post('/api/meal_related/create_meal', mealx)
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



// need this here since the save Recipe button is on this page
  const handleSaveAsRecipe = () => 
    { setShowNameInput(true);
      if (!namex.trim()) {
        setMessage('Please enter a name for the recipe.');
        return;
      }
    const newRecipe: IRecipex = {
      name: namex,
      details: selectedRows,
    };

    axios.post('/api/recipe_related/create_recipe', newRecipe)
      .then(response => {
        setMessage(response.data.message);
        setSelectedRows([]);
        setMessage('Recipe created successfully');
      }
    )
      .catch(error => 
        {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      });
    };

  
  


  return (
    <div className={styles['page-root']}>
      <div>
        <Link href="/">
          <span className={styles['back-to-home-page']}>Back to Home Page</span>
        </Link>
      </div>

      <div className={styles['select-food-group-container']}>
        <label htmlFor="select-food-group-item" className={styles['select-food-group-item-labelStyle']}>
          Select a food group
        </label>
        <div id="select-food-group-item">
          <Select
            options={dropdownOptions}
            onChange={(newValue) => {
              setDropdownSelectedValue(newValue[0]);
            }}
            values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
          />
        </div>
      </div>

      {dropdownSelectedValue && (
        <table className={styles['table-style']}>
          <thead className={styles['table-style']}>
            <tr>
              <th>Select</th>
              <th>Desc 1</th>
              <th>Desc 2</th>
              <th>Portion</th>
              <th>Calories</th>
              <th>Carb</th>
              <th>Fat</th>
              <th>Protein</th>
              <th>Fiber</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(item => item.desc1 === dropdownSelectedValue.value).map((item, index) => (
              <tr key={index}>
                <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                      }
                      setDropdownCheckedRows(new Set(dropdownCheckedRows));
                    }}
                  />
                </td>
                <td>{item.desc1}</td>
                <td>{item.desc2}</td>
                <td>{item.portion}</td>
                <td>{item.calories}</td>
                <td>{item.carb}</td>
                <td>{item.fat}</td>
                <td>{item.protein}</td>
                <td>{item.fiber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles['portion-container']}>
        <label htmlFor="portionSize">
          enter a portion size number and click Enter
        </label>
        <input
          id="portionSize"
          className={`${styles['portion-size-inputbox']} ${isBlinking ? styles['blink'] : ''}`}
          type="number"
          placeholder="1"
          onFocus={(e) => e.target.value = ""}
          value={portionSize}
          onChange={(e) => setPortionSize(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleApplyPortion();
            }
          }}
        />
      </div>

      <h2 className={styles.h2}>Selected Rows</h2>
      <table className={styles['table-style']}>
        <thead className={styles['table-style']}>
          <tr>
            <th className="text-left">Remove</th>
            <th className="text-left">Desc 1</th>
            <th className="text-left">Desc 2</th>
            <th className="text-right">Portion</th>
            <th className="text-right">Calories</th>
            <th className="text-right">Carb</th>
            <th className="text-right">Fat</th>
            <th className="text-right">Protein</th>
            <th className="text-right">Fiber</th>
            <th className="text-right">Datex</th>
          </tr>
        </thead>
        <tbody>
          {selectedRows.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td className="text-left">{item.desc1}</td>
              <td className="text-left">{item.desc2}</td>
              <td className="text-right">{item.portion}</td>
              <td className="text-right">{item.calories}</td>
              <td className="text-right">{item.carb}</td>
              <td className="text-right">{item.fat}</td>
              <td className="text-right">{item.protein}</td>
              <td className="text-right">{item.fiber}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr>
            <td>Totals</td>
            <td></td>
            <td className="text-right">{totals?.portionTot}</td>
            <td className="text-right">{totals?.caloriesTot}</td>
            <td className="text-right">{totals?.carbTot}</td>
            <td className="text-right">{totals?.fatTot}</td>
            <td className="text-right">{totals?.proteinTot}</td>
            <td className="text-right">{totals?.fiberTot}</td>
            <td></td>
          </tr>
        </tbody>
      </table>




  {selectedRows.length > 0 && (
    <>
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
        </div>
      )}

      <div>
        <button
          id="saveAsMealButton"
          className={styles['saveAsMealButtonStyle']}
          onClick={handleSaveAsMeal}
        >
          Save as Meal
        </button>
      </div>

      <div>
        <button
          id="saveAsRecipeButton"
          className={styles['saveAsRecipeButtonStyle']}
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
} 

export default CreateMeal;