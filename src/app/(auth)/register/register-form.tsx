"use client";

import { useActionState } from "react";
import { register } from "../actions";
import { Field, SubmitButton } from "../field";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <Field
        label="Nom"
        name="name"
        autoComplete="name"
        required
        defaultValue={state?.values?.name}
        errors={state?.fieldErrors?.name}
      />
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
        errors={state?.fieldErrors?.email}
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        errors={state?.fieldErrors?.password}
      />
      <Field
        label="Confirmer le mot de passe"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.fieldErrors?.confirm}
      />
      <SubmitButton pending={pending}>Créer mon compte</SubmitButton>
    </form>
  );
}
