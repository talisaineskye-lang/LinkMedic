/**
 * Migration script: Convert existing single-channel users to the new Channel model
 *
 * This script:
 * 1. Finds all users with youtubeChannelId set
 * 2. Creates a Channel record for their existing channel
 * 3. Associates existing videos with the channel
 * 4. Sets the channel as the user's activeChannelId
 *
 * Run with: npx tsx scripts/migrate-channels.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function migrateExistingChannels() {
  console.log("Starting channel migration...\n");

  // Find all users with a YouTube channel ID set
  const usersWithChannels = await prisma.user.findMany({
    where: {
      youtubeChannelId: { not: null },
    },
    select: {
      id: true,
      email: true,
      youtubeChannelId: true,
    },
  });

  console.log("Found " + usersWithChannels.length + " users with channels to migrate.\n");

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of usersWithChannels) {
    try {
      // Check if channel already exists for this user
      const existingChannel = await prisma.channel.findUnique({
        where: {
          userId_youtubeChannelId: {
            userId: user.id,
            youtubeChannelId: user.youtubeChannelId!,
          },
        },
      });

      if (existingChannel) {
        console.log(">> User " + user.email + ": Channel already migrated, skipping");
        skippedCount++;
        continue;
      }

      // Create Channel record
      const channel = await prisma.channel.create({
        data: {
          youtubeChannelId: user.youtubeChannelId!,
          title: "Imported Channel", // Will be updated on next sync
          userId: user.id,
        },
      });

      // Associate existing videos with this channel
      const updateResult = await prisma.video.updateMany({
        where: {
          userId: user.id,
          channelId: null, // Only update videos without a channel
        },
        data: {
          channelId: channel.id,
        },
      });

      // Set this as the user's active channel
      await prisma.user.update({
        where: { id: user.id },
        data: { activeChannelId: channel.id },
      });

      console.log("OK User " + user.email + ": Created channel, associated " + updateResult.count + " videos");
      migratedCount++;
    } catch (error) {
      console.error("ERR User " + user.email + ": Migration failed", error);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log("Migration complete!");
  console.log("  Migrated: " + migratedCount);
  console.log("  Skipped: " + skippedCount);
  console.log("  Errors: " + errorCount);
  console.log("========================================\n");
}

// Run the migration
migrateExistingChannels()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
