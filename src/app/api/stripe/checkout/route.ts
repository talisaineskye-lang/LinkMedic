import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST() {
  console.log("[Checkout] Starting checkout session creation...");

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Checkout] Missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Stripe not configured - missing secret key" }, { status: 500 });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      console.error("[Checkout] Missing STRIPE_PRICE_ID");
      return NextResponse.json({ error: "Stripe not configured - missing price ID" }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("[Checkout] Missing NEXT_PUBLIC_APP_URL");
      return NextResponse.json({ error: "App URL not configured" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("[Checkout] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Checkout] User ID:", session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, stripeCustomerId: true, tier: true },
    });

    if (!user) {
      console.log("[Checkout] User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[Checkout] User tier:", user.tier);

    // Check if user is already on a paid tier
    if (user.tier !== "TRIAL" && user.tier !== "AUDITOR") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    console.log("[Checkout] Session created successfully:", checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Checkout] Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
