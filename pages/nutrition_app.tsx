import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import nutritionTable from '../utils/nutrition_table';

const Select = dynamic(() => import('react-select'), { ssr: false})

interface Option {
  label: string;
  value: string;
}
interface NutritionItem {
  desc_1: string;
  desc_2: string;
  portion: number | undefined;
  calories:  number | undefined;
  carb: number | undefined;
  fat: number | undefined;
  protein: number | undefined;
  fiber: number | undefined;
  GI: number | undefined;
  note: string;
}

const NutritionApp = () => {
  const [selectedValue,     setSelectedValue] = useState<Option | null>(null);
  const [selectedRowOption, setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow,       setSelectedRow] = useState<NutritionItem | null>(null);
  const [portionNumber,     setPortionNumber] = useState<number | undefined>(undefined);
  const [options,           setOptions] = useState<Option[]>([]);
  const [data,              setData] = useState<NutritionItem[]>([]);
  const [rowOptions,        setRowOptions] = useState<Option[]>([]);
  const [portionSize,       setPortionSize] = useState<number>(1);
  const [name,              setName] = useState('');
  const [date,              setDate] = useState('');


// create list of unique values 
useEffect(() => {
  fetch('/api/nutrition')
    .then(response => response.json())
    .then(fetchedData => {
      setData(fetchedData || []);
      const uniqueValues = Array.from(new Set(fetchedData.map((item: NutritionItem) => item.desc_1)));
      setOptions(uniqueValues.map(value => ({ label: value as string, value: value as string })));
    })
    .catch(error => console.error('Error:', error));
}, []);

// filter db for selected value
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
}, [selectedRowOption, data]
);

const [selectedRows, setSelectedRows] = useState<NutritionItem[]>([]);

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
      fat: (selectedRow.fat  || NaN) * portionSize,
      protein: (selectedRow.protein || NaN) * portionSize,
      fiber: (selectedRow.fiber || NaN) * portionSize,
    };
    setSelectedRow(updatedRow);
    setSelectedRows(prevRows => [...prevRows, updatedRow]);
  }
};

const handleDeleteRow = (index: number) => {
  const newSelectedRows = [...selectedRows];
  newSelectedRows.splice(index, 1);
  setSelectedRows(newSelectedRows);
};

return (
  <div>
    <h1 
      className='header1' 
      style={{
        width: '25vw',
        textAlign: 'center',
        color: '#efc6ec',
        fontSize: '24px',
        border: '2px solid #efc6ec',
        padding:'5px',
        backgroundColor: '#2E0521'
      }}
    >
      Select items below 
    </h1>
    <div style={{
          width: '25vw',
          textAlign: 'center',
          margin: '25px',
          color: '#efc6ec',
          fontSize: '24px',
          border: '2px solid #efc6ec',
          padding:'5px',
          backgroundColor: '#371401'
        }}>
    <Select 
      className="select-component"
      options={options} 
      onChange={(newValue: unknown | null, _actionMeta) => 
        setSelectedValue(newValue as Option | null)}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,    // ... is the unpack operator
          primary25: '#650E1B',// font color of the selected item
          primary50: '#E5CBCF',// background color of the selected item
        },
      })} 
    />
    </div>

    {selectedValue && (
      <table
      style={{
        textAlign: 'right',
        width: '75vw',
        margin: "25px",
        backgroundColor: "#27de22",
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
            <th>Desc 1</th>
            <th>Desc 2</th>
            <th>Portion</th>
            <th>Calories</th>
            <th>Carb</th>
            <th>Fat</th>
            <th>Protein</th>
            <th>Fiber</th>
            <th> Select </th>

          </tr>
        </thead>
        <tbody>
          {data.filter(item => item.desc_1 === selectedValue.value).map((item, index) => (
            <tr key={index}>
              <td>{item.desc_1}</td>
              <td>{item.desc_2}</td>
              <td>{item.portion}</td>
              <td>{item.calories}</td>
              <td>{item.carb}</td>
              <td>{item.fat}</td>
              <td>{item.protein}</td>
              <td>{item.fiber}</td>
              <td>
                <input 
                  type="checkbox" 
                  onChange={() => handleRowSelect(item)}
            />
          </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

  <div 
    style={{
      margin: "35px",
      backgroundColor: 'rgb(185 132 132)',
      border: "1px solid #000",
    
    }}> 
    <label htmlFor="portionSize">Portion Size: </label>
    <input 
      id="portionSize"
      type="number" 
      placeholder='1'
      onFocus={(e) => e.target.value = ""}
      value={portionSize} 
      onChange={(e) => setPortionSize(Number(e.target.value))}       />
    <button 
      style={{
        backgroundColor: "rgb(185 132 135)", // background color
        color: 'black', // text color
        padding: '15px 32px', // padding
        textAlign: 'center', // text alignment
        textDecoration: 'none', // text decoration
        display: 'inline-block', // display type
        fontSize: '20px', // font size
        margin: '4px 2px', // margin
        cursor: 'pointer', // cursor type
      }}
      onClick={handleApplyPortion}>Accept portion size</button>
  </div>

    <h2>Selected Rows </h2>
    <table 
    style={{
      width: "100vh",
      margin: "35px",
      backgroundColor: "#47CDE0",
      border: "1px solid #000",
    }}> 
<thead
style={{
  margin: "35px",
  backgroundColor: "#1D8795",
  border: "1px solid #000",
}}
>
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
        <td></td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.calories || 0), 0)}</td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.carb || 0), 0)}</td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.fat || 0), 0)}</td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.protein || 0), 0)}</td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.fiber || 0), 0)}</td>
        <td>{selectedRows.reduce((total, row) => total + Number(row.portion || 0), 0)}</td>
        <td></td>
      </tr>

</tbody>
</table>

return (
<div>
  {/* ... */}
  <table>
    <tbody>
      {/* ... */}
    </tbody>
  </table>
  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Give it a name" />
  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
  <button onClick={saveAsRecipe}>Save as Recipe</button>
  <button onClick={saveAsMeal}>Save as Meal</button>
</div>
);



    </div>
  );

  function saveAsRecipe() {
    const data = { name, date, items: selectedRows };
    fetch('/api/saveRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(() => alert('Saved as recipe!'))
    .catch(err => console.error(err));
  }
  
  function saveAsMeal() {
    const data = { name, date, items: selectedRows };
    fetch('/public/meal.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(() => alert('Saved as meal!'))
    .catch(err => console.error(err));
  }
};

export default NutritionApp;