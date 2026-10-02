import Link from "next/link";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">Flux Général Paiement</h1>
      {session?.user ? (
        <Link
          href="/dashboard"
          className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Accéder au tableau de bord
        </Link>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
            Se connecter avec GitHub
          </button>
        </form>
      )}
    </main>
  );
}
