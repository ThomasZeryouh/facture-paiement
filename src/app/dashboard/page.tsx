import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "./actions";

const formatAmount = (cents: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    cents / 100,
  );

export default async function DashboardPage() {
  const session = await auth();
  const payments = await prisma.payment.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm text-zinc-500">{session?.user?.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">
            Se déconnecter
          </button>
        </form>
      </header>

      <section className="mb-10 rounded-lg border p-6">
        <h2 className="mb-4 font-medium">Nouveau paiement</h2>
        <form action={createCheckoutSession} className="flex gap-3">
          <input
            name="amount"
            type="number"
            min={1}
            step="0.01"
            defaultValue={10}
            required
            className="w-32 rounded-md border bg-transparent px-3 py-2"
          />
          <span className="self-center text-zinc-500">€</span>
          <button className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
            Payer avec Stripe
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-medium">Historique</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun paiement pour le moment.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{p.createdAt.toLocaleString("fr-FR")}</span>
                <span>{formatAmount(p.amount, p.currency)}</span>
                <span className="font-mono text-xs">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
