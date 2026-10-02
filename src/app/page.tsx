import Link from "next/link";
import { auth } from "@/auth";

const primary =
  "rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black";
const secondary =
  "rounded-md border px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">Flux Général Paiement</h1>
      {session?.user ? (
        <Link href="/dashboard" className={primary}>
          Accéder au tableau de bord
        </Link>
      ) : (
        <div className="flex gap-3">
          <Link href="/register" className={primary}>
            Créer un compte
          </Link>
          <Link href="/login" className={secondary}>
            Se connecter
          </Link>
        </div>
      )}
    </main>
  );
}
