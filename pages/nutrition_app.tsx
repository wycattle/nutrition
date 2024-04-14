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
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);
  const [selectedRowOption, setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow, setSelectedRow] = useState<NutritionItem | null>(null);
  const [portionNumber, setPortionNumber] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<Option[]>([]);
  const [data, setData] = useState<NutritionItem[]>([]);
  const [rowOptions, setRowOptions] = useState<Option[]>([]);
  const [portionSize, setPortionSize] = useState<number>(1);

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

  const [selectedRows, setSelectedRows] = useState<NutritionItem[]>([]);

  const handleRowSelect = (row: NutritionItem) => {
    setSelectedRows(prevRows => [...prevRows, row]);
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
      handleRowSelect(updatedRow);
    }
  };

  const handleDeleteRow = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1);
    setSelectedRows(newSelectedRows);
  };

  return (
    <div>
      <h1 className='header1'>Select an item </h1>
      <Select 
        className="select-component"
        options={options} 
        onChange={(newValue: unknown | null, _actionMeta) => setSelectedValue(newValue as Option | null)}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: 'rgb(160, 101, 101)',
          },
        })} 
      />

      {selectedValue && (
        <table>
          <thead>
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
                <td><button onClick={() => handleRowSelect(item)}>Select</button></td>
                
              </tr>
            ))}
    </tbody>
        </table>
      )}

    <div>
      <label htmlFor="portionSize">Portion Size: </label>
      <input 
        id="portionSize"
        type="number" 
        placeholder='1'
        onFocus={(e) => e.target.value = ""}
        value={portionSize} 
        onChange={(e) => setPortionSize(Number(e.target.value))}
      />
      <button onClick={handleApplyPortion}>Accept portion size</button>
    </div>



      <h2>Selected Rows </h2>
      <table>
  <thead>
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
  </tbody>
</table>
    </div>
  );
};

export default NutritionApp;