import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import nutritionTable from '../utils/nutrition_table';

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
  console.log('NutritionApp is rendering')
  const [selectedValue, setSelectedValue] = useState(null);
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    console.log( 'useEffect is running');

    fetch('/api/nutrition')
    .then(response => response.json())
    .then(data => {
      console.log(data);


      const uniqueValues = Array.from(new Set(data.map((item: NutritionItem) => item.desc_1)));
      setOptions(uniqueValues.map(value => ({ label: value as string, value: value as string })));
    });
  }, []);

  async function fetchData(): Promise<NutritionItem[]> {
    const data = await nutritionTable();
    return data;
  }

  return (
    <div>
      <h1 className='header1'>Select an item </h1>
      <Select 
        className="select-component"
        options={options} 
        onChange={(option: { value: string; label: string } | null) => setSelectedValue(option ? option.value : null)}
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