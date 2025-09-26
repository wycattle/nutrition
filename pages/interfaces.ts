//    /pages/interfaces.ts

export interface HomeProps{      }

export interface GlobalState {
    globalStateVariable: any;
    setGlobalStateVariable: (newValue: any) => void;
}

export interface IOption {
    label: string;
    value: string;   }


export interface IMealx {
    namex: string;
    datex: Date;
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
    namex: string;
    details: IMealDetail[];     }    

export interface IRecipeDetail {
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

export interface DailyTotal {
    id: number;
    day: string; // Assuming the date will be handled as a string
    calories: number;
    carbs: number;
    fat: number;
    fiber: number;
    portion_weight: number;
    protein: number;
  }