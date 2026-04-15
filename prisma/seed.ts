import { PrismaClient } from "../generated/prisma/client";
import {
  seedLocation,
  seedLocationFixedDaily,
  seedPricingTiers,
  seedVehicleRules,
} from "../tests/helpers/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.parkingLocation.upsert({
    where: { slug: seedLocation.slug },
    update: seedLocation,
    create: seedLocation,
  });

  await prisma.parkingLocation.upsert({
    where: { slug: seedLocationFixedDaily.slug },
    update: seedLocationFixedDaily,
    create: seedLocationFixedDaily,
  });

  for (const tier of seedPricingTiers) {
    await prisma.pricingTier.upsert({
      where: {
        locationId_vehicleType: {
          locationId: tier.locationId,
          vehicleType: tier.vehicleType,
        },
      },
      update: tier,
      create: tier,
    });
  }

  for (const rule of seedVehicleRules) {
    await prisma.vehicleTypeRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }

  console.log("Seeded locations:");
  console.log("  - /parkir/mall-xyz (Parkir Mall XYZ)");
  console.log("  - /parkir/gedung-abc (Gedung Parkir ABC)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
