import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { syncCheckoutSession } from "@/lib/payments";
import { formatPrice } from "@/lib/format";

const messages = {
  PAID: { emoji: "✅", title: "Paiement confirmé", text: "Merci pour votre achat !" },
  PENDING: {
    emoji: "⏳",
    title: "Paiement en cours",
    text: "Votre paiement est en cours de traitement. Le statut se mettra à jour automatiquement.",
  },
  FAILED: { emoji: "❌", title: "Paiement refusé", text: "Le paiement n'a pas abouti." },
  EXPIRED: { emoji: "⌛", title: "Session expirée", text: "La session de paiement a expiré." },
} as const;

export default async function SuccessPage({
  searchParams,
}: PageProps<"/dashboard/success">) {
  const { session_id } = await searchParams;
  if (typeof session_id !== "string") redirect("/dashboard");

  const session = await auth();
  const payment = await prisma.payment.findFirst({
    where: { stripeSessionId: session_id, userId: session!.user!.id },
  });
  if (!payment) redirect("/dashboard");

  // Ne dépend pas du webhook : on interroge Stripe directement
  if (payment.status === "PENDING") {
    await syncCheckoutSession(await stripe.checkout.sessions.retrieve(session_id));
  }

  const { status, amount, currency, product } =
    await prisma.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { product: true },
    });
  const message = messages[status];

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="text-5xl">{message.emoji}</span>
      <h1 className="text-2xl font-semibold">{message.title}</h1>
      <p className="text-zinc-500">
        {product.name} · {formatPrice(amount, currency)}
      </p>
      <p className="text-zinc-500">{message.text}</p>
      <Link href="/dashboard" className="underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
