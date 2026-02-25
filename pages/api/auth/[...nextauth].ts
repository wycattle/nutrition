import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers as needed
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      console.log("signIn callback:", { user, account, profile, email, credentials });
      return true;
    },
  },
};

export default NextAuth(authOptions);