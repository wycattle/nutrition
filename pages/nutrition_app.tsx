// pages/nutrition_app.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import saveAsMeal from '@/utils/save_meal';
import saveAsRecipe from '@/utils/save_recipe';
import Link from 'next/link';

// import link from 'next/link';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface Option {
  label: string;
  value: string;   
}

interface NutritionItem {
  desc_1:   string;
  desc_2:   string;
  portion:  number | undefined;
  calories: number | undefined;
  carb:     number | undefined;
  fat:      number | undefined;
  protein:  number | undefined;
  fiber:    number | undefined;
  GI:       number | undefined;
  note:     string;       
}

const NutritionApp = () => {
  const [selectedValue,       setSelectedValue] =     useState<Option | null>(null);
  const [selectedRowOption,   setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow,         setSelectedRow] =       useState<NutritionItem | null>(null);
  const [selectedRows,        setSelectedRows] =      useState<NutritionItem[]>([]);
  
  const [options,             setOptions] =           useState<Option[]>([]);
  const [data,                setData] =              useState<NutritionItem[]>([]);
  const [portionSize,         setPortionSize] =       useState<number>(0);
  const [checkedRows,         setCheckedRows] =       useState<Set<number>>(new Set());

  const [nomen,               setNomen] =             useState<string>('');
  const [datex,               setDatex] =             useState<Date>(new Date());
  const [data2,               setData2] =             useState<{ name: string; date: string; items: string[] }>({ name: '', date: '', items: [] });
  const [message,             setMessage] =           useState<string>('');


  useEffect(() => {
    fetch('/api/nutrition')   //the json created from nutrition_table
      .then(response => response.json())
      .then(fetchedData => {
        setData(fetchedData || []);
        const uniqueValues = Array.from(new Set(fetchedData.map((item: NutritionItem) => item.desc_1)));
        setOptions(uniqueValues.map(value => ({ label: value as string, value: value as string })));
      })
      .catch(error => console.error('Error:', error));
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
      setCheckedRows(new Set()); // Reset the checkedRows state
    }
  };

  const handleDeleteRow = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1);
    setSelectedRows(newSelectedRows);
  };

  const handleSaveAsMeal = async () => {
    const data = await saveAsMeal(nomen, datex, selectedRows);
    if (data) {
      setData2(data);
      setNomen('');
      setDatex(new Date());
      setMessage('Meal saved successfully.');
    }
  };

  const handleSaveAsRecipe = async () => {
    const data = await saveAsRecipe(nomen, datex, selectedRows);
    if (data) {
      setData2(data);
      setNomen('');
      setDatex(new Date());
      setMessage('Recipe saved successfully.');
    }
  };


  return (
    <div>

      <div>
        <Link href="/"> {}
          <a> Back to Home Page </a> {}
        </Link>
      </div>

      <div id='select food-group container' style={{ width: '25vw', margin: '25px auto', textAlign: 'center', fontSize: '20px', border: '2px solid #efc6ec', padding: '5px' }}>
        <Select className="select food-group item"
          options={options}
          onChange={(newValue: unknown | null, _actionMeta) =>
            setSelectedValue(newValue as Option | null)}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors, // ... is the unpack operator
              neutral0: "#301e25",
            },
          })}
          styles={{
            option: (provided, state) => ({
              ...provided,
              color: state.isSelected ? 'rgb(219 190 204)' : 'black',
            })
          }}
          placeholder=" Select a food group "
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
                <td>
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

      <div style={{ width: '350px', margin: "35px", backgroundColor: 'rgb(97 53 74 )', border: "5px solid #000" }}>
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
        style={{
          width: "100vh",
          margin: "35px",
          backgroundColor: "#2a3233",
          border: "1px solid #000",
        }}>
        <thead
          style={{
            margin: "35px",
            backgroundColor: "#244347",
            border: "1px solid #000",
          }}>
          <tr>
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
          {selectedRows.map((item, index) => (
            <tr key={index}>
              <td>{item.desc_1}</td>
              <td>{item.desc_2}</td>
              <td>{item.portion}</td>
              <td>{item.calories}</td>
              <td>{item.carb}</td>
              <td>{item.fat}</td>
              <td>{item.protein}</td>
              <td>{item.fiber}</td>
              <td><button onClick={() => handleDeleteRow(index)}>Delete</button></td>
            </tr>
          ))}

          <tr>
            <td>Total</td>
            <td></td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.portion || 0), 0)}</td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.calories || 0), 0)}</td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.carb || 0), 0)}</td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.fat || 0), 0)}</td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.protein || 0), 0)}</td>
            <td>{selectedRows.reduce((total, row) => total + Number(row.fiber || 0), 0)}</td>
            <td></td>
          </tr>

        </tbody>
      </table>

        <div>
          <label htmlFor='nameItBox' style={{marginRight: '10px'}}> Give it a name:</label>
          <input
            id='nameItBox'
            style={{
              width: '15vw',
              marginLeft: '25px',
              marginBottom: '25px',
              fontSize: '16px',
              border: '1px solid #efc6ec',
            }}
            type="text" 
            value={nomen} 
            onChange={e => setNomen(e.target.value)} 
            placeholder="fill me in" 
          />
        </div>  

        <div>
        <label htmlFor='dateItBox' style={{marginRight: '10px'}}> default date is today :</label>
          <input
            id='dateItBox'
            style={{
              width: '15vw',
              marginLeft: '25px',
              fontSize: '16px',
              border: '1px solid #efc6ec',
            }}
            type="date" 
            value={datex?.toISOString().split('T')[0]} 
            onChange={e => setDatex(new Date(e.target.value))} 
          />
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
  );


};

export default NutritionApp;
