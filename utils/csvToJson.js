// utils/csvToJson.js
import csv from 'csvtojson'; //this imports the package

const csvToJson = async (csvFilePath) => {
  try {
    const jsonObj = await csv().fromFile(csvFilePath);
    return jsonObj;
  } catch (error) {
    console.error('Error while converting CSV to JSON:', error);
  }
};

export default csvToJson;