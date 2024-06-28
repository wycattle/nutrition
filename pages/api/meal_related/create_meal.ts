//pages/api/meal_related/create_meal.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import { IMealAllData } from '../../interfaces.ts';
import meal_instance from '../../service/meal_service.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mealDB = await meal_instance;

console.log('response: ', res)


  try {
    if (req.method === 'POST') {
      const { 
        name, 
        datex, 
        desc1, 
        desc2, 
        portion,       
        calories,
        carb,
        fat,
        protein,
        fiber,
        GI
      } = req.body; 
   

     
      try {
        const newMeal = await mealDB.createMeal({
          name, 
          datex, 
          desc1, 
          desc2, 
          portion,       
          calories,
          carb,
          fat,
          protein,
          fiber,
          GI
        });
        res.status(200).json({ meal: newMeal }); 
      } catch (error) {
        console.error('Error in createMeal:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/meal_related/create_meal:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}