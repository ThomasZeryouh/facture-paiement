import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { syncCheckoutSession } from "@/lib/payments";
import { PaymentStatus } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    console.error(`[stripe webhook] ${message}`);
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      await syncCheckoutSession(event.data.object);
      break;
    case "checkout.session.async_payment_failed":
      await syncCheckoutSession(event.data.object, PaymentStatus.FAILED);
      break;
  }

  return Response.json({ received: true });
}
