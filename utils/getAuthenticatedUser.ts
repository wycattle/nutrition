
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../lib/postgres";

/**
 * Gets the authenticated user's session and their UUID from the Neon users table.
 * Optimized: If userId is already in the session, use it. Otherwise, look up by email and store in session.
 * Throws if not authenticated or user not found.
 */
export async function getAuthenticatedUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  // If userId is already in the session, use it
  if (session.user && (session.user as any).userId) {
    return { session, userId: (session.user as any).userId };
  }

  const email = session.user?.email;
  if (!email) {
    throw new Error("User email not found in session");
  }

  // Look up the canonical UUID from the users table
  console.time('auth-db-lookup');
  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  console.timeEnd('auth-db-lookup');
  if (result.rows.length === 0) {
    throw new Error(`User not found in DB for email: ${email}`);
  }

  const userId: string = result.rows[0].id; // UUID

  // Store userId in session for future requests (if possible)
  // Note: next-auth session is usually stateless JWT, so this only works if using a database/session store
  if (session.user) {
    (session.user as any).userId = userId;
  }

  return { session, userId };
}