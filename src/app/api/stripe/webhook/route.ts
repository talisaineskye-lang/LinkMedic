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
          // Check if subscription is active or past_due (still give access)
          const isActive =
            subscription.status === "active" ||
            subscription.status === "past_due";

          await prisma.user.update({
            where: { id: user.id },
            data: {
              tier: isActive ? "SPECIALIST" : "FREE",
              videoScanLimit: isActive ? 100 : 15,
              monitoringEnabled: isActive,
              alertsEnabled: isActive,
            },
          });
          console.log(
            `[Stripe] Subscription updated for user ${user.id}: ${subscription.status}`
          );
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
              tier: "FREE",
              stripeSubscriptionId: null,
              videoScanLimit: 15,
              monitoringEnabled: false,
              alertsEnabled: false,
            },
          });
          console.log(`[Stripe] User ${user.id} downgraded to FREE`);
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
