# Flux Général Paiement

Next.js 16 (App Router) · Prisma 7 (MySQL/MariaDB via XAMPP) · Auth.js v5 (e-mail + mot de passe) · Stripe Checkout

## Démarrage

```bash
cp .env.example .env        # puis renseigner les clés (AUTH_SECRET : npx auth secret)
# Démarrer MySQL dans XAMPP et créer la base flux_paiement
npm install
npm run db:migrate
npx prisma generate
npx prisma db seed        # 4 produits de démo
npm run dev
```

Webhooks Stripe en local (Stripe CLI) :

```bash
npm run stripe:listen       # copier le whsec_... affiché dans STRIPE_WEBHOOK_SECRET
```

## Structure

| Fichier | Rôle |
| --- | --- |
| `prisma/schema.prisma` | `User`, `Product`, `Payment` |
| `src/auth.ts` | Auth.js : provider Credentials, mots de passe bcrypt, sessions JWT |
| `src/proxy.ts` | Protège `/dashboard/*`, renvoie les connectés hors de `/login` et `/register` |
| `src/app/(auth)/` | Pages et Server Actions de connexion / inscription |
| `src/lib/prisma.ts` | Client Prisma singleton (adapter `mariadb`) |
| `src/lib/stripe.ts` | Client Stripe (serveur uniquement) |
| `src/app/dashboard/page.tsx` | Grille des produits + derniers achats |
| `src/app/dashboard/products/[slug]/page.tsx` | Fiche produit + bouton Payer |
| `src/app/dashboard/actions.ts` | Server Action : crée la session Checkout (prix lu en base) |
| `prisma/seed.ts` | Produits de démo |
| `src/app/api/webhooks/stripe/route.ts` | Met à jour le statut des paiements |
