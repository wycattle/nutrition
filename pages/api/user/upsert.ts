import type { NextApiRequest, NextApiResponse } from 'next';

// This endpoint is retired.
// User creation is now handled automatically by the @auth/pg-adapter
// in pages/api/auth/[...nextauth].ts.
// Seeding of user_nutrition and user_recipes happens in the signIn callback.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ message: 'Endpoint retired. User management is handled by NextAuth adapter.' });
}
