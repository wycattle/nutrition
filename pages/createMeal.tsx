// pages/createMeal.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import saveAsMeal from '@/utils/save_meal';
import { saveMealGroupedByDate } from '@/lib/db';
import Link from 'next/link';
import { CSSObject } from '@emotion/react';
import { OptionProps, GroupBase, MenuListProps } from 'react-select';

const Select = dynamic(() => import('react-select'), { ssr: false });

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
  portionTotal: number;
  caloriesTotal: number;
  carbTotal: number;
  fatTotal: number;
  proteinTotal: number;
  fiberTotal: number;
}

const customStyles = {
  menuList: (provided: CSSObject, state: MenuListProps<unknown, boolean, GroupBase<unknown>>) => ({
    ...provided,
    backgroundColor: '#59a184', // color for the dropdown list
    color: '#f3f74d', //  color for the font
  })
}
const CreateMeal = () => {
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);
  const [selectedRowOption, setSelectedRowOption] = useState<Option | null>(null);
  const [selectedRow, setSelectedRow] = useState<NutritionItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<NutritionItem[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [data, setData] = useState<NutritionItem[]>([]);
  const [portionSize, setPortionSize] = useState<number>(0);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [nomen, setNomen] = useState<string>('');
  const [datex, setDatex] = useState<Date>(new Date());
  const [data2, setData2] = useState<{ name: string; date: string; items: string[] }>({ name: '', date: '', items: [] });
  const [message, setMessage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());


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


      console.log('3 selectedValue state:', selectedValue);

    }
  }, [selectedValue, data]);

  useEffect(() => {
    if (selectedRowOption) {
      const selectedRowIndex = parseInt(selectedRowOption.value);
      const selectedRow = data.find((item, index) => index === selectedRowIndex);
      setSelectedRow(selectedRow || null);
      console.log('5 State after selectedRowOption change:', {
        selectedValue,
        selectedRowOption,
        selectedRow,
        selectedRows,
        options,
        data,
        portionSize,
        checkedRows,
        nomen,
        datex,
        data2,
        message,
        startDate,
        endDate,
      });
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
      setCheckedRows(new Set());
    }
  };

  const handleDeleteRow = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1);
    setSelectedRows(newSelectedRows);
  };

  const handleSaveAsMeal = async () => {
    const newMeal = {
      name: nomen,
      date: datex,
      items: selectedRows,
    };

    try {
      const response = await fetch('/api/saveMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMeal),
      });

      if (!response.ok) {
        throw new Error('Failed to save meal');
      }

      const data = await response.json();
      setMessage(data.message);
      setSelectedRows([]); // Clear the selected rows
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
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
      </div>
  );
}
 export default CreateMeal;
