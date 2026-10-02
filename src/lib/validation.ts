import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide").trim().toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nom requis").max(100),
    email: z.email("Adresse e-mail invalide").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .max(72, "72 caractères maximum"), // limite de bcrypt
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });
