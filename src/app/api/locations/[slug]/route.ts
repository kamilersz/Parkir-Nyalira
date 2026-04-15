import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const location = await db.parkingLocation.findUnique({
    where: { slug },
    include: {
      pricingTiers: { where: { isActive: true } },
      vehicleTypeRules: {
        where: { isActive: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!location || !location.isActive) {
    return NextResponse.json(
      { error: "Lokasi tidak ditemukan" },
      { status: 404 },
    );
  }

  const { pricingTiers, vehicleTypeRules, ...locationData } = location;

  return NextResponse.json({
    location: locationData,
    pricingTiers: pricingTiers.filter((t: any) => t.isActive),
    vehicleTypeRules: vehicleTypeRules.filter((r: any) => r.isActive),
  });
}
