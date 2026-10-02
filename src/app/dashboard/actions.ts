"use server";

import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(productId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Le prix vient toujours de la base, jamais du client
  const product = await prisma.product.findUnique({
    where: { id: productId, active: true },
  });
  if (!product) notFound();

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
          currency: product.currency,
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
      },
    ],
    metadata: { userId: user.id, productId: product.id },
    success_url: `${appUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/products/${product.slug}`,
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      productId: product.id,
      stripeSessionId: checkout.id,
      amount: product.price,
      currency: product.currency,
    },
  });

  redirect(checkout.url!);
}
