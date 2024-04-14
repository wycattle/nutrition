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
  const [selectedRow, setSelectedRow] = useState<NutritionItem | null>(null);
  const [portionNumber, setPortionNumber] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<Option[]>([]);
  const [data, setData] = useState<NutritionItem[]>([]);

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
            {/* your table rows here */}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NutritionApp;