import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Helper to get authenticated user session and userId from API route.
 * Throws if not authenticated.
 */
export async function getAuthenticatedUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  // Use session.user.id or session.user.email depending on your provider
  const userId = session.user.id || session.user.email;
  return { session, userId };
}