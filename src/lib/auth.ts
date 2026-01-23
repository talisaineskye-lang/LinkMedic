import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { trackServerEvent, SERVER_ANALYTICS_EVENTS } from "./posthog-server";
import { sendWelcomeEmail } from "./email";

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
      console.log("[NextAuth] signIn callback", {
        email: user?.email,
        provider: account?.provider,
        accountId: account?.providerAccountId
      });
      return true;
    },
    async session({ session, user }) {
      console.log("[NextAuth] session callback", {
        userId: user?.id,
        userEmail: user?.email
      });
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] redirect callback", { url, baseUrl });
      // Redirect to dashboard after signin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("[NextAuth] EVENT signIn", { userId: user?.id, provider: account?.provider, isNewUser });
      // Track sign in (returning user)
      if (user?.id && !isNewUser) {
        await trackServerEvent(user.id, SERVER_ANALYTICS_EVENTS.USER_SIGNED_IN, {
          provider: account?.provider,
          email: user.email,
        });
      }
    },
    async createUser({ user }) {
      console.log("[NextAuth] EVENT createUser", { userId: user?.id, email: user?.email });
      // Track new user signup
      if (user?.id) {
        await trackServerEvent(user.id, SERVER_ANALYTICS_EVENTS.USER_SIGNED_UP, {
          email: user.email,
          name: user.name,
        });
      }
      // Send welcome email to new users
      if (user?.email) {
        await sendWelcomeEmail(user.email, user.name || undefined);
      }
    },
    async linkAccount({ user, account }) {
      console.log("[NextAuth] EVENT linkAccount", { userId: user?.id, provider: account?.provider });
    },
    async session({ session }) {
      console.log("[NextAuth] EVENT session", { userId: session?.user?.id });
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
  debug: true,
};
