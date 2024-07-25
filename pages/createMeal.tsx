// pages/createMeal.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import axios from 'axios';

import { IOption , IRecipeDetail, IRecipex, IMealDetail, IMealx  } from './interfaces';
import Link from 'next/link';

const CreateMeal = () => {
  const [dropdownSelectedValue, setDropdownSelectedValue]         = useState< IOption | null>(null);
  const [selectedRow, setSelectedRow]             = useState< IMealDetail | null>(null);
  const [selectedRows, setSelectedRows]           = useState< IMealDetail[]>([]);
  const [dropdownOptions, setDropdownOptions]     = useState< IOption[] >([]);
  
  const [options, setOptions]                     = useState< IOption[] >([]);
  const [data, setData]                           = useState< IMealDetail[]>([]);
  const [portionSize, setPortionSize]             = useState< number>(0);
  const [dropdownCheckedRows, setDropdownCheckedRows]         = useState< Set<number>>(new Set());

  const [isBlinking, setIsBlinking] = useState(false);
  
  const [name, setName]                           = useState< string>('');
  const [datex, setDatex]                         = useState< Date>(new Date());
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


  // fetch nutritionData from the '/api/nutrition' endpoint
  useEffect(() => {
    axios.get('/api/nutrition')
      .then(response => {
        setData(response.data || []);

  // create the dropdown for foodgroups
        const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, response.data));
        const dropdownOptions = R.map((value: string) => ({ label: value, value }), uniqueValues);
        setDropdownOptions(dropdownOptions);
      })
      .catch(error => {
        console.error('Stack:', error.stack);
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



  const handleCreateTotals = (mealData) => {
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

  const handleSaveAsMeal = () => {
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
      namex: '',
      datex: new Date,
      details: mealDetails,
    };


  axios.post('/api/meal_related/create_meal', mealx)
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
    const newRecipe: IRecipex = {
      namex: name,
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
      }
    );



    


  function DropdownComponent() {
    useEffect(() => {
      console.log('dropdownOptions changed:', dropdownOptions);
    }, [dropdownOptions]);
    return null;
  }
  
  
  
    };


  return ( 
    <div>
      <div>
        <Link href="/"> {}
          <a  className='back-to-home-page'> Back to Home Page </a>
        </Link>
      </div>

      <div className='select-food-group-container'
          style={{
            width: '25%', 
            margin: 'auto', 
            textAlign: 'center',
            fontSize: '1.125rem', 
            border: '2px solid #0fcd45', 
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
          options={dropdownOptions}
          onChange={(newValue) => {
            setDropdownSelectedValue(newValue[0]);
          }}
          values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
        />
      </div>


      </div>

          {dropdownSelectedValue && (
            <table className='table-style' style={{ backgroundColor: "#301e1e",}}>

              <thead className = 'table-style' style={{backgroundColor: "#f2f2f2", }}>

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
          className={`portion-size-inputbox ${isBlinking ? ' blink' : ''}`}
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
        
      <table    className = 'table-style' style={{ backgroundColor: "#301e1e",}}>
              
        <thead  className = 'table-style' style={{backgroundColor: "#f2f2f2", }}>

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
              <td> <input 
                type="checkbox"
                onChange={() => handleCheckboxChange(index)}/>
              </td>
              <td className='text-left'>{item.desc1}</td>
              <td className='text-left'>{item.desc2}</td>
              <td className='text-right'>{item.portion}</td>
              <td className='text-right'>{item.calories}</td>
              <td className='text-right'>{item.carb}</td>
              <td className='text-right'>{item.fat}</td>
              <td className='text-right'>{item.protein}</td>
              <td className='text-right'>{item.fiber}</td>
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
          <label htmlFor='nameItBox' > Give it a name:</label>
          <input
            id='nameItBox'
            className='text-box'
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
