import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Créer un compte</h1>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-zinc-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-foreground underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
