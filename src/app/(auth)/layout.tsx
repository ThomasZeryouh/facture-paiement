import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-lg font-semibold">
        Flux Général Paiement
      </Link>
      <div className="w-full max-w-sm rounded-lg border p-8">{children}</div>
    </main>
  );
}
