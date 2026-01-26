import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

// Tier type (matches Prisma UserTier enum)
type Tier = "TRIAL" | "AUDITOR" | "SPECIALIST" | "OPERATOR";

// Map price IDs to tiers
// Uses env vars: STRIPE_PRICE_ID_SPECIALIST, STRIPE_PRICE_ID_OPERATOR
// Falls back to STRIPE_PRICE_ID for backward compatibility (maps to SPECIALIST)
function getTierFromPriceId(priceId: string): Tier {
  const operatorPriceId = process.env.STRIPE_PRICE_ID_OPERATOR;
  const specialistPriceId = process.env.STRIPE_PRICE_ID_SPECIALIST || process.env.STRIPE_PRICE_ID;

  if (operatorPriceId && priceId === operatorPriceId) {
    return "OPERATOR";
  }
  if (specialistPriceId && priceId === specialistPriceId) {
    return "SPECIALIST";
  }

  // Default to SPECIALIST for unknown price IDs (backward compatibility)
  console.log(`[Stripe] Unknown price ID ${priceId}, defaulting to SPECIALIST`);
  return "SPECIALIST";
}

// Get tier settings (video limit, etc.)
function getTierSettings(tier: Tier) {
  if (tier === "OPERATOR") {
    return {
      videoScanLimit: 500,
      monitoringEnabled: true,
      alertsEnabled: true,
    };
  }
  // SPECIALIST or fallback
  return {
    videoScanLimit: 100,
    monitoringEnabled: true,
    alertsEnabled: true,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const metadataTier = session.metadata?.tier as Tier | undefined;

        if (userId && session.subscription) {
          // Fetch the subscription to get the price ID
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Determine tier from price ID or metadata
          const priceId = subscription.items.data[0]?.price?.id;
          const tier: Tier = priceId
            ? getTierFromPriceId(priceId)
            : metadataTier || "SPECIALIST";

          const tierSettings = getTierSettings(tier);

          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: tier as any, // Cast to bypass TypeScript caching issue
              stripeSubscriptionId: session.subscription as string,
              subscriptionCancelAt: null,
              ...tierSettings,
            },
          });
          console.log(`[Stripe] User ${userId} upgraded to ${tier}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
          // Check if subscription is scheduled to cancel at period end
          if (subscription.cancel_at_period_end && subscription.cancel_at) {
            // Subscription scheduled to cancel - keep access but track cancel date
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionCancelAt: new Date(subscription.cancel_at * 1000),
              },
            });
            console.log(
              `[Stripe] Subscription scheduled to cancel on ${new Date(subscription.cancel_at * 1000).toISOString()} for user ${user.id}`
            );
          } else {
            // Subscription reactivated (user un-cancelled) or status changed
            const isActive =
              subscription.status === "active" ||
              subscription.status === "past_due";

            if (isActive) {
              // Determine tier from current price ID
              const priceId = subscription.items.data[0]?.price?.id;
              const tier: Tier = priceId
                ? getTierFromPriceId(priceId)
                : (user.tier as Tier);
              const tierSettings = getTierSettings(tier);

              await prisma.user.update({
                where: { id: user.id },
                data: {
                  tier: tier as any, // Cast to bypass TypeScript caching issue
                  subscriptionCancelAt: null,
                  ...tierSettings,
                },
              });
              console.log(
                `[Stripe] Subscription updated for user ${user.id}: ${subscription.status}, tier: ${tier}`
              );
            } else {
              // Subscription not active - downgrade
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  tier: "AUDITOR" as const,
                  subscriptionCancelAt: null,
                  videoScanLimit: 15,
                  monitoringEnabled: false,
                  alertsEnabled: false,
                },
              });
              console.log(
                `[Stripe] Subscription inactive for user ${user.id}: ${subscription.status}, downgraded to AUDITOR`
              );
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tier: "AUDITOR" as const,
              stripeSubscriptionId: null,
              subscriptionCancelAt: null,
              videoScanLimit: 15,
              monitoringEnabled: false,
              alertsEnabled: false,
            },
          });
          console.log(`[Stripe] Subscription ended for user ${user.id}, reverted to AUDITOR`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          console.log(`[Stripe] Payment failed for user ${user.id}`);
          // TODO: Send email notification about payment failure
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
