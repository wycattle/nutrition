// pages/api/deleteMeal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '../../lib/db';

export default async function deleteMeal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body;
    const db = await openDb();

    try {
      await db.run('DELETE FROM meals WHERE name = ?', name);
      res.status(200).json({ message: 'Meal deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while deleting the meal.' });
    }
  } else {
    res.status(405).json({ error: 'We only support POST' });
  }
}