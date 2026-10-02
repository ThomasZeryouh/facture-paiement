"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  amount: z.coerce.number().min(1).max(10_000),
});

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { amount } = checkoutSchema.parse({ amount: formData.get("amount") });
  const amountInCents = Math.round(amount * 100);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountInCents,
          product_data: { name: "Paiement Flux" },
        },
      },
    ],
    metadata: { userId: user.id },
    success_url: `${appUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard`,
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      stripeSessionId: checkout.id,
      amount: amountInCents,
      currency: "eur",
    },
  });

  redirect(checkout.url!);
}
