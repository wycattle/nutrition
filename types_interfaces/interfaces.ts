//    /pages/interfaces.ts

import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

// export interface HomepageType{      }

export interface GlobalState {
    globalStateVariable: any;
    setGlobalStateVariable: (newValue: any) => void;
}

export interface IOption {
    label: string;
    value: string;   }


export interface IMealx {
  date: string;
  timestamp: string;
  details: IMealDetail[];     //example of 'composition'
  user_id?: string;
}


export interface IMealDetail {
    desc1   : string;
    desc2   : string;
    portion : number | undefined; 
    calories: number | undefined;
    carb    : number | undefined;
    fat     : number | undefined;
    protein : number | undefined;
    fiber   : number | undefined;
    GI      : number | undefined;
    note    : string;    }




export interface IRecipex {
    name: string;
    details: IMealDetail[];     }    

 

export interface IDailyMealTotalx {
  id: number;
  date: string;
  timestamp: string;
  caloriesTot: number;
  carbTot: number;
  fatTot: number;
  fiberTot: number;
  portionTot: number;
  proteinTot: number;
  user_id?: string;
}


// For recipe totals row
export interface IRecipeTotals {
  name: string;
  caloriesTot: number;
  carbTot: number;
  fatTot: number;
  fiberTot: number;
  portionTot: number;
  proteinTot: number;
}



export interface Meal_View_Props {
  dropdownOptions: IOption[];
  dropdownSelectedValue: IOption | null;
  setDropdownSelectedValue: (value: IOption | null) => void;
  data: IMealDetail[];
  dropdownCheckedRows: Set<number>;
  setDropdownCheckedRows: (rows: Set<number>) => void;
  handleRowSelect: (row: IMealDetail) => void;
  portionSize: number;
  setPortionSize: (size: number) => void;
  isBlinking: boolean;
  handleApplyPortion: () => void;
  selectedRows: IMealDetail[];
  handleCheckboxChange: (index: number) => void;
  totals: {
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
  };
  showNameInput: boolean;
  namex: string;
  setName: (name: string) => void;
  handleSaveAsMeal: () => void;
  handleSaveAsRecipe: () => void;
  message: string;
}  
