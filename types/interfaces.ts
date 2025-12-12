//    /pages/interfaces.ts

// export interface HomepageType{      }

export interface GlobalState {
    globalStateVariable: any;
    setGlobalStateVariable: (newValue: any) => void;
}

export interface IOption {
    label: string;
    value: string;   }


export interface IMealx {
    date: Date;
    timestamp: string;
    details: IMealDetail[];     }


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

 

export interface IDailyTotalx {
    id: number;
    day: string; // Assuming the date will be handled as a string
    calories: number;
    carbs: number;
    fat: number;
    fiber: number;
    portion_weight: number;
    protein: number;
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



export interface IndexViewProps {
  dropdownOptions: IOption[];
  dropdownSelectedValue: IOption | null;
  setDropdownSelectedValue: (value: IOption) => void;
  data: IMealDetail[];
  portionSize: number;
  setPortionSize: (value: number) => void;
  selectedRows: IMealDetail[];
  totals: {
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
  };
  handleRowSelect: (item: IMealDetail) => void;
  handleRemoveRow: (index: number) => void;
  showNameInput: boolean;
  namex: string;
  setName: (value: string) => void;
  handleSaveAsMeal: () => void;
  handleSaveAsRecipe: () => void;
  message: string;
}