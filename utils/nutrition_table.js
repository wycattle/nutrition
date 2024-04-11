// utils/nutrition_table.js
import csv from 'csvtojson';

const nutrition_table = async () => {
  try {
    const jsonObj = await csv().fromFile('E:\\old_F_drive\\human_nutrition\\nutrition_table.csv');
    return jsonObj;
  } catch (error) {
    console.error('Error while converting CSV to JSON:', error);
  }
};
export default nutrition_table;