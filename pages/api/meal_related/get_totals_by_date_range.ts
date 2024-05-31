// pages/api/meal_related/get_totals_by_date_range.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Meal_instance from '../../service/meal.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  const meal = await Meal_instance;
  const { startDate, endDate } = req.query;

  console.log('api Start date:', startDate);
  console.log('api End date:', endDate);

  
  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    res.status(400).json({ error: 'Invalid date parameters' });
    return;
  }

  try {
    const meals = await meal.getTotalsByDateRange(new Date(startDate), new Date(endDate));
    console.log ('api-data for meal.getTotalsByDateRange:', meals)
    res.status(200).json(meals);
  } catch (error) {
    console.error('Error in getTotalsByDateRange:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}