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
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.access_token) {
        // Store tokens in the user record
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token || null,
            tokenExpiry: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
            // Set trial end date on first sign up (7 days from now)
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
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
