// pages/api/nutrition.js
import csvToJson from '../../utils/csvToJson';

const nutritionData = async (req, res) => {
  const csvFilePath = 'E:\\old_F_drive\\human_nutrition\\nutrition_table.csv';
  const data = await csvToJson(csvFilePath);
  res.status(200).json(data);
};

export default nutritionData;