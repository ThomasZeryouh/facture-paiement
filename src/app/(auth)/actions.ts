"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

// N'accepte que des chemins internes pour éviter les redirections ouvertes
function safeCallbackUrl(value: FormDataEntryValue | null) {
  const url = typeof value === "string" ? value : "";
  return url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";
}

async function signInWithCredentials(
  email: string,
  password: string,
  redirectTo: string,
): Promise<FormState | undefined> {
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    // signIn lève une redirection Next en cas de succès : on la laisse passer
    if (error instanceof AuthError) {
      return { error: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }
}

export async function login(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState | undefined> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);
  const values = { email: String(raw.email ?? "") };

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  const result = await signInWithCredentials(
    parsed.data.email,
    parsed.data.password,
    safeCallbackUrl(formData.get("callbackUrl")),
  );
  return result && { ...result, values };
}

export async function register(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState | undefined> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  const values = {
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
  };

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  const { name, email, password } = parsed.data;

  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: { email: ["Un compte existe déjà avec cet e-mail."] },
        values,
      };
    }
    throw error;
  }

  return signInWithCredentials(email, password, "/dashboard");
}
