// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Pool } from 'pg';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', ['POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//   try {
//     const { desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note } = req.body;
//     await pool.query(
//       `INSERT INTO nutrition_master (desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
//       [desc1, desc2, portion ?? 1, calories, carb, fat, protein, fiber, gi ?? '', note ?? '']
//     );
//     res.status(200).json({ message: 'Nutrition row inserted' });
//   } catch (error) {
//     console.error('Error inserting nutrition row:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   } finally {
//     pool.end();
//   }
// }
