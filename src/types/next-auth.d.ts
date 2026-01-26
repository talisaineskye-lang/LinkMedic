import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      youtubeChannelId?: string | null;
      tier?: "TRIAL" | "AUDITOR" | "SPECIALIST" | "OPERATOR";
      trialEndsAt?: Date | null;
    };
  }

  interface User {
    id: string;
    youtubeChannelId?: string | null;
    tier?: "TRIAL" | "AUDITOR" | "SPECIALIST" | "OPERATOR";
    trialEndsAt?: Date | null;
  }
}
