// pages/createMeal.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import axios from 'axios';

import { Option, MealItem, NewMeal, NewRecipe } from './interfaces';
// import { MealType } from '../lib/types/meal.types';

import Link from 'next/link';

const CreateMeal = () => {
  const [selectedValue, setSelectedValue]         = useState<Option | null>(null);
  const [selectedRowOption, setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow, setSelectedRow]   = useState<MealItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<MealItem[]>([]);
  const [options, setOptions]           = useState<Option[]>([]);

  const [data, setData]               = useState<MealItem[]>([]);
  const [portionSize, setPortionSize] = useState<number>(0);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [name, setName]               = useState<string>('');
  const [datex, setDatex]             = useState<Date>(new Date());

  const[totals, setTotals]            = useState(
    {
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });
  const [message, setMessage]         = useState<string>('');


  // This useEffect is used to fetch nutritionData from the '/api/nutrition' endpoint
  useEffect(() => {
    axios.get('/api/nutrition')
      .then(response => {
        setData(response.data || []);
  
        const uniqueValues = R.uniq(R.map((item: MealItem) => item.desc_1, response.data));
        setOptions(R.map((value: string) => ({ label: value, value }), uniqueValues));
      })
      .catch(error => {
        console.error('Stack:', error.stack);
      });
  }, []);
  


  useEffect(() => {
    if (selectedValue) {
      const selectedRow = data.find(item => item.desc_1 === selectedValue.value);
      setSelectedRow(selectedRow || null);
    }
  }, [selectedValue, data]
);


  useEffect(() => {
    if (selectedRowOption) {
      const selectedRowIndex = parseInt(selectedRowOption.value);
      const selectedRow = data.find((item, index) => index === selectedRowIndex);
      setSelectedRow(selectedRow || null);
    }
  }, [selectedRowOption, data]);



  const handleRowSelect = (row: MealItem) => {
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
      setCheckedRows(new Set());
    }};


  const handleDeleteRow = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1);
    setSelectedRows(newSelectedRows);        };


  const handleSaveAsMeal = () => 
    {
    const currentDate = new Date();
    
    //create an instance of NewMeal (defined in interface)
    const newMeal: NewMeal = 
    {
      name: name,
      datex: currentDate,
      items: selectedRows,
    };
  
    axios.post('/api/meal_related/create_meal', newMeal)
      .then(response => 
        {
        setMessage(response.data.message);
        const createdMeal = response.data;
        setTotals(createdMeal.totals);

        setMessage('Meal created successfully');
      })
      .catch(error => 
        {
        if (axios.isAxiosError(error)) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred');
        }
      })
    };


// need this here since the save Recipe button is on this page
    const handleSaveAsRecipe = () => 
      {
      const currentDate = new Date();
      const newRecipe: NewRecipe = {
        name: name,
        items: selectedRows,
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
        }
      );
    };


  return ( 
    <div>
      <div id='back to home page'>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
      </div>

      <div id='select-food-group-container'
          style={{
            width: '25%', 
            margin: 'auto', 
            textAlign: 'center',
            fontSize: '1.125rem', 
            border: '2px solid #ed64a6', 
            padding: '0.25rem', 
          }}
      >
        <label htmlFor="select-food-group-item"   //The htmlFor attribute in HTML is used to associate a <label> with a form control like an <input>, <textarea>, or <select>//
          style={{
            display: 'block',
            marginBottom: '10px',
            backgroundColor: '#473a3f',
            border: "10px",
          }}>
             Select a food group
        </label>

      <div id="select-food-group-item">
        <Select 
          options={options}
          onChange={(newValue) => {
            setSelectedValue(newValue[0]);
          }}
          values={selectedValue ? [selectedValue] : []}
        />
      </div>


      </div>

          {selectedValue && (
            <table
              style={{
                textAlign: 'right',
                width: '75vw',
                margin: "25px",
                backgroundColor: "#301e1e",
                border: "1px solid #000",
              }}>
              <thead
                style={{
                  width: '75vw',
                  textAlign: 'right',
                  margin: "25px",
                  backgroundColor: "#f2f2f2",
                  border: "1px solid #000",
                }}>
                <tr>
                  <th> Select </th>
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
                {data.filter(item => item.desc_1 === selectedValue.value).map((item, index) => (
                  <tr key={index}>
                  <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ transform: "scale(2)" }}
                        checked={checkedRows.has(index)}
                        onChange={() => {
                          handleRowSelect(item);
                          if (checkedRows.has(index)) {
                            checkedRows.delete(index);
                          } else {
                            checkedRows.add(index);
                          }
                          setCheckedRows(new Set(checkedRows));
                        }}
                      />
                    </td>
                    <td>{item.desc_1}</td>
                    <td>{item.desc_2}</td>
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


      <div className="w-88 m-9 bg-purple-900 border-black">
        <label htmlFor="portionSize"
          style={{
            width: '15px',
            fontSize: '20px',
            color: 'rgb(219 190 204)',
            padding: '10px',
            margin: '5px',
          }}> enter a portion size number and click Enter </label>
        <input
          id="portionSize"
          type="number"
          placeholder='1'
          style={{
            width: "75px",
            backgroundColor: "rgb(66 33 49)",
            fontSize: '15px',
            color: 'rgb(219 190 204)',
            padding: '10px',
            margin: '5px',
          }}
          onFocus={(e) => e.target.value = ""}
          value={portionSize}
          onChange={(e) => setPortionSize(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleApplyPortion();
            };
          }}
        />
      </div>

      
      <h2>Selected Rows </h2>
        
      <table
        id="tableForSelectedRows"
        className='w-screen m-9 bg-gray-800 border border-black'>
        <thead className='m-9 bg-blue-900 border border-black' >
          <tr>
            <th className='text-left'>Desc 1</th>
            <th className='text-left'>Desc 2</th>
            <th className='text-right'>Portion </th>
            <th className='text-right'>Calories</th>
            <th className='text-right'>Carb</th>
            <th className='text-right'>Fat</th>
            <th className='text-right'>Protein</th>
            <th className='text-right'>Fiber</th>
            <th className='text-right'>Datex</th>
          </tr>
        </thead>
        <tbody>
          {selectedRows.map((item, index) => (
            <tr key={index}>
              <td className='text-left'>{item.desc_1}</td>
              <td className='text-left'>{item.desc_2}</td>
              <td className='text-right'>{item.portion}</td>
              <td className='text-right'>{item.calories}</td>
              <td className='text-right'>{item.carb}</td>
              <td className='text-right'>{item.fat}</td>
              <td className='text-right'>{item.protein}</td>
              <td className='text-right'>{item.fiber}</td>
              <td className='text-right'><button onClick={() => handleDeleteRow(index)}>Delete</button></td>
            </tr>
          ))}

          {/* Totals row */}
          <tr>
            <td>Totals</td>
            <td></td>
            <td className='text-right'>{totals?.portionTot}</td>
            <td className='text-right'>{totals?.caloriesTot}</td>
            <td className='text-right'>{totals?.carbTot}</td>
            <td className='text-right'>{totals?.fatTot}</td>
            <td className='text-right'>{totals?.proteinTot}</td>
            <td className='text-right'>{totals?.fiberTot}</td>
            <td></td>
          </tr>
        </tbody>
      </table>


      <div>
          <label htmlFor='nameItBox' className='label'> Give it a name:</label>
          <input
            id='nameItBox'
            className='input'
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="fill me in" 
          />

          <style >{`
            .label {
              margin-right: 10px;
            }
            .input {
              width: 16.6666666667%; 
              margin-left: 1.5rem;
              margin-bottom: 1.5rem; 
              font-size: 0.875rem; 
              border: 1px solid #ed64a6; 
            }
          `}</style>
      </div>
      <div>
          <button
            id='saveAsMealButton'
            style={{
              width: '15vw',
              margin: '25px ',
              textAlign: 'left',
              fontSize: '16px',
              border: '2px solid #efc6ec',
              backgroundColor: "#694242",
              padding: '5px',
            }}
            onClick={handleSaveAsMeal}
          >
            Save as Meal
          </button>
      </div>

      <div>
          <button
            id='saveAsRecipeButton'
            style={{
              width: '15vw',
              margin: '25px ',
              textAlign: 'center',
              fontSize: '16px',
              border: '2px solid #efc6ec',
              backgroundColor: "#694242",
              padding: '5px',
            }}
            onClick={handleSaveAsRecipe} 
            >
            Save as Recipe
          </button>
      </div>


      {message && <p>{message}</p>}


      </div>
      
)};

 export default CreateMeal;
