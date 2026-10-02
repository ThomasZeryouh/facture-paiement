import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

function statusFromSession(session: Stripe.Checkout.Session) {
  if (session.status === "expired") return PaymentStatus.EXPIRED;
  if (session.payment_status === "paid") return PaymentStatus.PAID;
  // "complete" + "unpaid" : moyen de paiement asynchrone (SEPA…) en cours
  return null;
}

// Met à jour le paiement local à partir de la session Checkout Stripe.
// Appelé par le webhook et par la page de succès (au cas où le webhook tarde).
export async function syncCheckoutSession(
  session: Stripe.Checkout.Session,
  status: PaymentStatus | null = statusFromSession(session),
) {
  if (!status) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await prisma.payment.updateMany({
    // Un paiement confirmé ne repasse jamais à un autre statut
    where: { stripeSessionId: session.id, status: { not: PaymentStatus.PAID } },
    data: { status, stripePaymentIntentId: paymentIntentId ?? undefined },
  });
}
