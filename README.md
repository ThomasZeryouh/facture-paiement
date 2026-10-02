# Flux Général Paiement

Next.js 16 (App Router) · Prisma 7 (PostgreSQL) · Auth.js v5 (GitHub) · Stripe Checkout

## Démarrage

```bash
cp .env.example .env        # puis renseigner les clés (AUTH_SECRET : npx auth secret)
npm install
npm run db:up               # Postgres via Docker, port hôte 5440
npm run db:migrate
npm run dev
```

Webhooks Stripe en local (Stripe CLI) :

```bash
npm run stripe:listen       # copier le whsec_... affiché dans STRIPE_WEBHOOK_SECRET
```

## Structure

| Fichier | Rôle |
| --- | --- |
| `prisma/schema.prisma` | Modèles Auth.js + `Payment` |
| `src/auth.ts` | Config Auth.js (adapter Prisma, sessions en base) |
| `src/proxy.ts` | Protège `/dashboard/*` (ex-`middleware` en Next 16) |
| `src/lib/prisma.ts` | Client Prisma singleton (adapter `pg`) |
| `src/lib/stripe.ts` | Client Stripe (serveur uniquement) |
| `src/app/dashboard/actions.ts` | Server Action : crée la session Checkout |
| `src/app/api/webhooks/stripe/route.ts` | Met à jour le statut des paiements |
