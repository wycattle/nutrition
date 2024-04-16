// /pages/api/saveRecipe.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = req.body
    const filePath = path.resolve('./public/meals.json')
    const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    recipes.push(data)
    fs.writeFileSync(filePath, JSON.stringify(recipes))
    res.status(200).json({ message: 'Meal saved successfully' })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}