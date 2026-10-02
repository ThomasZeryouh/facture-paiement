import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Connexion</h1>
      <LoginForm
        callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined}
      />
      <p className="mt-6 text-center text-sm text-zinc-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-foreground underline">
          S&apos;inscrire
        </Link>
      </p>
    </>
  );
}
