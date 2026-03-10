import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import pool from "../../../lib/postgres";

export const authOptions: NextAuthOptions = {
  // The adapter manages users, accounts, sessions automatically.
  // A new user row is created on first login regardless of which
  // provider they use — GitHub, Google, etc. each get their own
  // row in the accounts table, all pointing to the same user UUID.
  adapter: PostgresAdapter(pool) as any,

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`, 
      options: {
        domain: undefined, // Will be set dynamically below
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Try to find an existing user by email
      try {
        const client = await pool.connect();
        try {
          // Find user by email
          const existingUser = await client.query(
            `SELECT id FROM users WHERE email = $1`,
            [user.email]
          );
          if (existingUser.rows.length > 0) {
            // If the account is not already linked, link it
            const userId = existingUser.rows[0].id;
            // Insert into accounts table if not exists
            await client.query(
              `INSERT INTO accounts ("userId", type, provider, "providerAccountId")
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (provider, "providerAccountId") DO NOTHING`,
              [userId, account?.type, account?.provider, account?.providerAccountId]
            );
            user.id = userId; // Ensure NextAuth uses the existing user
          }
          // Seed user_nutrition if empty
          await client.query('BEGIN');
          const nutCount = await client.query(
            `SELECT COUNT(*) FROM user_nutrition WHERE user_id = $1`,
            [user.id]
          );
          if (parseInt(nutCount.rows[0].count) === 0) {
            await client.query(
              `INSERT INTO user_nutrition
                 (user_id, desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note)
               SELECT $1, desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note
               FROM nutrition_master`,
              [user.id]
            );
            console.log(`Seeded nutrition for: ${user.email}`);
          }
          // Seed user_recipes if empty
          const recCount = await client.query(
            `SELECT COUNT(*) FROM user_recipes WHERE user_id = $1`,
            [user.id]
          );
          if (parseInt(recCount.rows[0].count) === 0) {
            await client.query(
              `INSERT INTO user_recipes (user_id, name, details, category)
               SELECT $1, name, details, category FROM recipes`,
              [user.id]
            );
            console.log(`Seeded recipes for: ${user.email}`);
          }
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('Seeding error:', err);
        } finally {
          client.release();
        }
      } catch (err) {
        console.error('DB connect error during signIn:', err);
      }
      return true;
    },
  },
};


export default NextAuth(authOptions);