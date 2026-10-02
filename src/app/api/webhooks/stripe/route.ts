import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
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
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // Les moyens de paiement asynchrones (SEPA…) arrivent "unpaid" au completed
      if (session.payment_status === "paid") {
        await updatePayment(session, PaymentStatus.PAID);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
      await updatePayment(event.data.object, PaymentStatus.FAILED);
      break;
    case "checkout.session.expired":
      await updatePayment(event.data.object, PaymentStatus.EXPIRED);
      break;
  }

  return Response.json({ received: true });
}

async function updatePayment(
  session: Stripe.Checkout.Session,
  status: PaymentStatus,
) {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: { status, stripePaymentIntentId: paymentIntentId ?? undefined },
  });
}
