// CreateRecipe.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as R from 'ramda';;

import Link from 'next/link';
import { CSSObject } from '@emotion/react';
import { OptionProps, GroupBase, MenuListProps } from 'react-select';

const Select = dynamic(() => import('react-select'), { ssr: false })

interface Option {
  label: string;
  value: string;
}

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

interface Per100gRow {
  portionPer100g: number;
  caloriesPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  proteinPer100g: number;
  fiberPer100g: number;
}

const customStyles = {
  menuList: (provided: CSSObject, state: MenuListProps<unknown, boolean, GroupBase>) => ({
    ...provided,
    backgroundColor: '#59a184', // color for the dropdown list
    color: '#f3f74d', // color for the font
  })
}

const CreateRecipe = () => {

    const [selectedValue,       setSelectedValue] =     useState<Option | null>(null);
    const [selectedRowOption,   setSelectedRowOption] = useState<Option | null>(null);
    const [selectedRow,         setSelectedRow] =       useState<NutritionItem | null>(null);
    const [selectedRows,        setSelectedRows] =      useState<NutritionItem[]>([]);
    const [options,             setOptions] =           useState<Option[]>([]);

    const [data,                setData] =              useState<NutritionItem[]>([]);
    const [portionSize,         setPortionSize] =       useState<number>(0);
    const [checkedRows,         setCheckedRows] =       useState<Set<number>>(new Set());
    
    const [nomen,               setNomen] =             useState<string>('');
    const [per100g,             setper100g] =           useState<number>(0);
    const [totals,              settotals] =            useState<number>(0);

    const [message,             setMessage] =           useState<string>('');

    const CreateRecipe = {
        name: nomen,
        totals: totals,
        per100g: per100g
    };

    try {
      await saveMealGroupedByDate(meal);
      console.log('Meal saved successfully');
    } catch (error) {
      console.error('Error:', error);
    }
 

  const handleSaveAsPer100g = () => {
    // Calculate total values
    const totalPortion = Math.round(selectedRows.reduce((total, row) => total + Number(row.portion || 0), 0));
    const totalCalories = Math.round(selectedRows.reduce((total, row) => total + Number(row.calories || 0), 0));
    const totalCarb = Math.round(selectedRows.reduce((total, row) => total + Number(row.carb || 0), 0));
    const totalFat = Math.round(selectedRows.reduce((total, row) => total + Number(row.fat || 0), 0));
    const totalProtein = Math.round(selectedRows.reduce((total, row) => total + Number(row.protein || 0), 0));
    const totalFiber = Math.round(selectedRows.reduce((total, row) => total + Number(row.fiber || 0), 0));

    // Calculate per 100g values
    const portionPer100g = 1;
    const caloriesPer100g = Math.round((totalCalories / totalPortion));
    const carbPer100g = Math.round((totalCarb / totalPortion));
    const fatPer100g = Math.round((totalFat / totalPortion));
    const proteinPer100g = Math.round((totalProtein / totalPortion));
    const fiberPer100g = Math.round((totalFiber / totalPortion));

    // Set per100g state
    setPer100g({
      name: nomen,
      portion: portionPer100g,
      calories: caloriesPer100g,
      carb: carbPer100g,
      fat: fatPer100g,
      protein: proteinPer100g,
      fiber: fiberPer100g,
    });
  };
};


export default CreateRecipe;