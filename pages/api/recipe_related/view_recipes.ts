// pages/api/view_recipes.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      const recipes = await prisma.recipeTable.findMany();
      const parsedRecipes = recipes.map(recipe => ({
        ...recipe,
        items: typeof recipe.items === 'string' ? JSON.parse(recipe.items) : recipe.items,
      }));
      res.json(parsedRecipes); // Send parsedRecipes in the response
    } else {
      // Handle any other HTTP method
      res.status(405).json({ message: 'Method not allowed' });
    }
  }