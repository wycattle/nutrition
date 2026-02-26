import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * this grabs the user ID and 
 * Helper to get authenticated user session and userId from API route.
 * Throws if not authenticated.
 */
export async function getAuthenticatedUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  // Use email as userId for simplicity
  const userId = session.user?.email;
  if (!userId) {
    throw new Error("User email not found in session");
  }
  return { session, userId };
}