import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.access_token) {
        try {
          // Store tokens in the user record
          // Use upsert to handle both new and existing users
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token || null,
              tokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              accessToken: account.access_token,
              refreshToken: account.refresh_token || null,
              tokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        } catch (error) {
          console.error("Error storing tokens:", error);
          // Don't block sign-in if token storage fails
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            youtubeChannelId: true,
            subscriptionStatus: true,
            trialEndsAt: true,
          },
        });
        if (dbUser) {
          session.user.youtubeChannelId = dbUser.youtubeChannelId;
          session.user.subscriptionStatus = dbUser.subscriptionStatus;
          session.user.trialEndsAt = dbUser.trialEndsAt;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
};
