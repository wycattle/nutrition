// pages/createMeal.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as R from 'ramda';

import Link from 'next/link';
import { CSSObject } from '@emotion/react';
import { OptionProps, GroupBase, MenuListProps } from 'react-select';

const Select = dynamic(() => import('react-select'), { ssr: false });


/*An interface in TypeScript is a way to define a contract for a certain structure of an object.
*/
interface Option {
  label: string;
  value: string;   }

interface NutritionItem {
    desc_1: string;
    desc_2: string;
    portion: number | undefined;
    calories: number | undefined;
    carb: number | undefined;
    fat: number | undefined;
    protein: number | undefined;
    fiber: number | undefined;
    GI: number | undefined;
    note: string;
    date: Date;
  }
 
interface TotalsRow {
  portion_tot: number;
  calories_tot: number;
  carb_tot: number;
  fat_tot: number;
  protein_tot: number;
  fiber_tot: number;
}

interface NewMeal {
  name: string;
  date: Date;
  items: NutritionItem[];
  totals: TotalsRow;
}

/* 
Custom styles for the dropdown menu.
 */
const customStyles = {
  menuList: (provided: CSSObject, state: MenuListProps<unknown, boolean, GroupBase<unknown>>) => ({
    ...provided,
    backgroundColor: '#59a184', 
    color: '#f3f74d', 
  })
}

const CreateMeal = () => {
  const [selectedValue, setSelectedValue]         = useState<Option | null>(null);
  const [selectedRowOption, setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow, setSelectedRow]   = useState<NutritionItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<NutritionItem[]>([]);
  const [options, setOptions]           = useState<Option[]>([]);

  const [data, setData]               = useState<NutritionItem[]>([]);
  const [portionSize, setPortionSize] = useState<number>(0);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());

  const [nomen, setNomen]             = useState<string>('');
  const [datex, setDatex]             = useState<Date>(new Date());
  
  const [message, setMessage]         = useState<string>('');


/**
 *  calculateTotals is a function declaration.
* It defines a function that takes an array of NutritionItem (see interface) objects 
*  and returns a TotalsRow object. This function uses the reduce method 
* to accumulate totals from the NutritionItem objects.
*/

const calculateTotals = (rows: NutritionItem[]): TotalsRow => {
    return rows.reduce(
      (totals, row) => 
        {
          return {
            portion_tot:      totals.portion_tot  + (row.portion || 0),
            calories_tot:     totals.calories_tot + (row.calories || 0),
            carb_tot:         totals.carb_tot     + (row.carb || 0),
            fat_tot:          totals.fat_tot      + (row.fat || 0),
            protein_tot:      totals.protein_tot  + (row.protein || 0),
            fiber_tot:        totals.fiber_tot    + (row.fiber || 0),
          };
        }, 
        {
          portion_tot: 0,
          calories_tot: 0,
          carb_tot: 0,
          fat_tot: 0,
          protein_tot: 0, // corrected here
          fiber_tot: 0,
        }
    );
  };



  
  /**
   * The second const, totals, is a variable declaration. It calls the calculateTotals function
 with selectedRows as the argument and assigns the result to the totals variable.
   */
  const totals = calculateTotals(selectedRows);


  useEffect(() => {
    fetch('/api/nutrition')   //don't erase - this is the nutrition json
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(fetchedData => {
        setData(fetchedData || []);          //the 'data' var holds the state value
  
         // Use Ramda's uniq and map functions to create unique options
      const uniqueValues = R.uniq(R.map((item: NutritionItem) => item.desc_1, fetchedData));
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
  }, [selectedValue, data]);


  useEffect(() => {
    if (selectedRowOption) {
      const selectedRowIndex = parseInt(selectedRowOption.value);
      const selectedRow = data.find((item, index) => index === selectedRowIndex);
      setSelectedRow(selectedRow || null);
    }
  }, [selectedRowOption, data]);



  const handleRowSelect = (row: NutritionItem) => {
    setSelectedRow(row);
  };


  /*Updates the selected row with the specified portion size and recalculates the nutritional values.   
  */
  const handleApplyPortion = () => {
    if (selectedRow) {
      const updatedRow = {
        ...selectedRow,
        portion: portionSize,
        calories: (selectedRow.calories || NaN) * portionSize,
        carb: (selectedRow.carb || NaN) * portionSize,
        fat: (selectedRow.fat || NaN) * portionSize,
        protein: (selectedRow.protein || NaN) * portionSize,
        fiber: (selectedRow.fiber || NaN) * portionSize,
      };
      setSelectedRow(updatedRow);
      setSelectedRows(prevRows => [...prevRows, updatedRow]);
      setCheckedRows(new Set());
    }
  };




  const handleDeleteRow = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1);
    setSelectedRows(newSelectedRows);
  };


  const handleSaveAsMeal = async () => {
    const newMeal: NewMeal = {
      name: nomen,
      date: datex,
      items: selectedRows,
      totals: totals,
    };
  
    try {
      const response = await fetch('/api/meal_related/saveMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMeal),
      });
  

      if (!response.ok) {
        throw new Error('Response is not OK');
      }
  
      const result = await response.json();

  
      setMessage(result.message);
      setSelectedRows([]); // Clear the selected rows
      
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);  //(property) Error.message: string
      } else {
        setMessage('An error occurred');
      }
    }
  }




  return ( 
    <div>
      <div id='back to home page'>
        <Link href="/"> {}
          <a> Back to Home Page </a>
        </Link>
      </div>

      <div id='select food-group container'
          style={{
            width: '25%', 
            margin: 'auto', 
            textAlign: 'center',
            fontSize: '1.125rem', 
            border: '2px solid #ed64a6', 
            padding: '0.25rem', 
          }}
      >
        <label htmlFor=" Select a food group " 
          style={{
            display: 'block',
            marginBottom: '10px',
            backgroundColor: '#473a3f',
            border: "10px",
          }}>
             Select a food group
        </label>

        <Select id="select food-group item"
          options={options}
          onChange={(newValue: unknown | null, _actionMeta) => {

            setSelectedValue(newValue as Option | null);
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors, // ... is the unpack operator
              neutral0: "#6b555e", //border around small box with down caret next to it
            },
          })}
          styles={{
            ...customStyles, 
            option: (provided: CSSObject, state: OptionProps<unknown, boolean, GroupBase<unknown>>) => ({
              ...provided,
              color: state.isSelected ? '#dbbecc' : '#292426',  // light pink if selected, blackish if not selected
            })
          }}
       
        />
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
      <td className='text-right'>{totals.portionTotal}</td>
      <td className='text-right'>{totals.caloriesTotal}</td>
      <td className='text-right'>{totals.carbTotal}</td>
      <td className='text-right'>{totals.fatTotal}</td>
      <td className='text-right'>{totals.proteinTotal}</td>
      <td className='text-right'>{totals.fiberTotal}</td>
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
            value={nomen} 
            onChange={e => setNomen(e.target.value)} 
            placeholder="fill me in" 
          />

          <style jsx>{`
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
              textAlign: 'center',
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


      {message && <p>{message}</p>}


      </div>
      
  );
}
 export default CreateMeal;
