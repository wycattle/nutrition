// // pages/api/saveRecipe.ts
// import fs from 'fs';
// import { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   console.log('Received request to save recipe');

//   if (req.method === 'POST') {
//     try {
//       console.log('Processing POST request');

//       const { name, date, items } = req.body; // Extract data from the request body
//       console.log('Received data:', { name, date, items });

//       // Logic to append data to the "recipes.json" file
//       const recipes = JSON.parse(fs.readFileSync('recipes.json', 'utf-8'));
//       console.log('Existing recipes:', recipes);

//       recipes.push({ name, date, items });
//       console.log('Updated recipes:', recipes);

//       fs.writeFileSync('recipes.json', JSON.stringify(recipes));
//       console.log('Recipes saved successfully');

//       res.status(200).json({ message: 'Recipe saved successfully' });
//     } catch (error) {
//       console.error('Error saving recipe:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   } else {
//     console.log('Received unsupported method:', req.method);
//     res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }
