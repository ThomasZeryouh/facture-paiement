import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const products = [
  {
    slug: "pack-starter",
    name: "Pack Starter",
    description:
      "L'essentiel pour démarrer : accès à la plateforme, 1 utilisateur et support par e-mail.",
    price: 1900,
    emoji: "🚀",
  },
  {
    slug: "pack-pro",
    name: "Pack Pro",
    description:
      "Pour les équipes en croissance : 5 utilisateurs, exports avancés et support prioritaire.",
    price: 4900,
    emoji: "💼",
  },
  {
    slug: "pack-entreprise",
    name: "Pack Entreprise",
    description:
      "Utilisateurs illimités, SSO, accompagnement dédié et engagement de disponibilité.",
    price: 14900,
    emoji: "🏢",
  },
  {
    slug: "formation",
    name: "Formation 1 h",
    description:
      "Une session visio d'une heure avec un expert pour prendre en main l'outil.",
    price: 9000,
    emoji: "🎓",
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`${products.length} produits insérés`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
