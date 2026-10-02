import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { createCheckoutSession } from "../../actions";
import { PayButton } from "./pay-button";

export default async function ProductPage({
  params,
}: PageProps<"/dashboard/products/[slug]">) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
  });
  if (!product) notFound();

  const checkout = createCheckoutSession.bind(null, product.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-8 inline-block text-sm text-zinc-500 hover:underline"
      >
        ← Retour aux produits
      </Link>

      <article className="rounded-lg border p-8">
        <span className="text-6xl">{product.emoji}</span>
        <h1 className="mt-6 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>

        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <span className="text-2xl font-semibold">
            {formatPrice(product.price, product.currency)}
          </span>
          <form action={checkout}>
            <PayButton />
          </form>
        </div>
      </article>
    </div>
  );
}
