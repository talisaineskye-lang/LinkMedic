import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

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

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: "SPECIALIST",
              stripeSubscriptionId: session.subscription as string,
              subscriptionCancelAt: null, // Clear any pending cancellation
              videoScanLimit: 100,
              monitoringEnabled: true,
              alertsEnabled: true,
            },
          });
          console.log(`[Stripe] User ${userId} upgraded to SPECIALIST`);
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

            await prisma.user.update({
              where: { id: user.id },
              data: {
                tier: isActive ? "SPECIALIST" : "AUDITOR",
                subscriptionCancelAt: null, // Clear cancellation if reactivated
                videoScanLimit: isActive ? 100 : 15,
                monitoringEnabled: isActive,
                alertsEnabled: isActive,
              },
            });
            console.log(
              `[Stripe] Subscription updated for user ${user.id}: ${subscription.status}, cancel_at cleared`
            );
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
              tier: "AUDITOR",  // They've used the product, so they're an AUDITOR not TRIAL
              stripeSubscriptionId: null,
              subscriptionCancelAt: null, // Clear cancellation date
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
