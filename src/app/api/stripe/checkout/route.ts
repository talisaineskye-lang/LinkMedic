import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// Price ID mapping for each tier
// Uses STRIPE_PRICE_ID_SPECIALIST and STRIPE_PRICE_ID_OPERATOR env vars
// Falls back to STRIPE_PRICE_ID for backward compatibility
const getPriceId = (tier: "SPECIALIST" | "OPERATOR"): string | undefined => {
  if (tier === "OPERATOR") {
    return process.env.STRIPE_PRICE_ID_OPERATOR;
  }
  return process.env.STRIPE_PRICE_ID_SPECIALIST || process.env.STRIPE_PRICE_ID;
};

export async function POST(request: Request) {
  console.log("[Checkout] Starting checkout session creation...");

  try {
    // Parse request body to get tier
    let requestedTier: "SPECIALIST" | "OPERATOR" = "SPECIALIST"; // Default
    try {
      const body = await request.json();
      if (body.tier === "OPERATOR" || body.tier === "SPECIALIST") {
        requestedTier = body.tier;
      }
    } catch {
      // No body is fine, use default
    }

    console.log("[Checkout] Requested tier:", requestedTier);

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Checkout] Missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Stripe not configured - missing secret key" }, { status: 500 });
    }

    const priceId = getPriceId(requestedTier);
    if (!priceId) {
      console.error(`[Checkout] Missing price ID for ${requestedTier}`);
      return NextResponse.json({ error: `Stripe not configured - missing price ID for ${requestedTier}` }, { status: 500 });
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

    console.log("[Checkout] User current tier:", user.tier);

    // Check if user is already on a paid tier (allow upgrade from SPECIALIST to OPERATOR)
    if (user.tier === "OPERATOR") {
      return NextResponse.json(
        { error: "You already have the highest tier subscription" },
        { status: 400 }
      );
    }

    if (user.tier === "SPECIALIST" && requestedTier === "SPECIALIST") {
      return NextResponse.json(
        { error: "You already have this subscription tier" },
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
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        tier: requestedTier, // Store the intended tier for webhook reference
      },
    });

    console.log("[Checkout] Session created successfully:", checkoutSession.id, "for tier:", requestedTier);
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
