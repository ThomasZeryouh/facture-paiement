import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Paiement reçu</h1>
      <p className="text-zinc-500">
        Le statut sera confirmé dès réception du webhook Stripe.
      </p>
      <Link href="/dashboard" className="underline">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
