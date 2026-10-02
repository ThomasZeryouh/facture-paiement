"use client";

import { useFormStatus } from "react-dom";

export function PayButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="rounded-md bg-black px-6 py-3 font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
    >
      {pending ? "Redirection…" : "Payer"}
    </button>
  );
}
