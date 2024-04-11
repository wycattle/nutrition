// app/csvToJson.js
import csv from 'csvtojson';

const csvToJson = async (csvFilePath) => {
  try {
    const jsonObj = await csv().fromFile('E:\\old_F_drive\\human_nutrition\\nutrition_table.csv');
    return jsonObj;
  } catch (error) {
    console.error('Error while converting CSV to JSON:', error);
  }
};

export default csvToJson;