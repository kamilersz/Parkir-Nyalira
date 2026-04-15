import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { ParkingFlow } from "./parking-flow-client";

export const revalidate = 0;

export default async function ParkirPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const location = await db.parkingLocation.findUnique({
    where: { slug, isActive: true },
    include: {
      pricingTiers: { where: { isActive: true } },
      vehicleTypeRules: {
        where: { isActive: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!location) {
    notFound();
  }

  const { pricingTiers, vehicleTypeRules, ...locationData } = location;

  return (
    <ParkingFlow
      location={{
        id: locationData.id,
        name: locationData.name,
        slug: locationData.slug,
        address: locationData.address,
        pricingMode: locationData.pricingMode as "FLAT_HOURLY" | "FIXED_DAILY",
      }}
      pricingTiers={pricingTiers.map((t) => ({
        id: t.id,
        vehicleType: t.vehicleType,
        firstHourRate: t.firstHourRate,
        additionalHourRate: t.additionalHourRate,
        dailyRate: t.dailyRate,
        maxDailyRate: t.maxDailyRate,
        gracePeriodMinutes: t.gracePeriodMinutes,
        isActive: t.isActive,
      }))}
      vehicleTypeRules={vehicleTypeRules.map((r) => ({
        vehicleType: r.vehicleType,
        pattern: r.pattern,
        priority: r.priority,
        isActive: r.isActive,
      }))}
    />
  );
}
