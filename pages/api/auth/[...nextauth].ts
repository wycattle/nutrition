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
      clientId: process.env.OAuth_client_ID!,
      clientSecret: process.env.OAuth_client_secret!,
    }),
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