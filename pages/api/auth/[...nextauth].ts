import NextAuth, { NextAuthOptions, Session, User, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: NextAuthOptions = {
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
  //this entire callbacks section is covered in Next defaults - add only if customization required
  
  // callbacks: {
  //   async signIn({ user, account, profile, email, credentials }: any) {
  //     console.log("signIn callback:", { user, account, profile, email, credentials });
  //     return true;
  //   },
  //   async jwt({ token, user, profile }: any) {
  //     // Always set token.id from user.id or profile.sub
  //     if (user?.id) {
  //       token.id = user.id;
  //     } else if (profile?.sub) {
  //       token.id = profile.sub;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }: any) {
  //     // Always set session.user.id from token.id
  //     if (session.user && token?.id) {
  //       session.user.id = token.id;
  //     }
  //     return session;
  //   },
  // },
};

export default NextAuth(authOptions);