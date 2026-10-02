import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function DashboardPage() {
  const session = await auth();
  const [products, payments] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    }),
    prisma.payment.findMany({
      where: { userId: session!.user!.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <section className="mb-12">
        <h1 className="mb-6 text-2xl font-semibold">Produits</h1>
        {products.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun produit. Lance <code>npx prisma db seed</code>.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/dashboard/products/${product.slug}`}
                  className="flex h-full flex-col rounded-lg border p-5 transition hover:border-zinc-400 hover:shadow-sm dark:hover:border-zinc-600"
                >
                  <span className="mb-4 text-4xl">{product.emoji}</span>
                  <span className="font-medium">{product.name}</span>
                  <span className="mt-1 line-clamp-2 flex-1 text-sm text-zinc-500">
                    {product.description}
                  </span>
                  <span className="mt-4 font-semibold">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-medium">Mes derniers achats</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun achat pour le moment.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {payments.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-sm"
              >
                <span>
                  {p.product.name}
                  <span className="ml-2 text-zinc-500">
                    {p.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                </span>
                <span>{formatPrice(p.amount, p.currency)}</span>
                <span className="font-mono text-xs">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
