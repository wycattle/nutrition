import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github"; // or your chosen provider

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // Add more providers as needed
  ],
  // ...other NextAuth options
};

export default NextAuth(authOptions);