import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "~/server/better-auth/server";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  const locations = await db.locationAdmin.findMany({
    where: { userId: session.user.id },
    include: { location: true },
  });

  return NextResponse.json({
    locations: locations.map((l: any) => l.location),
  });
}

const createLocationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  address: z.string().optional(),
  pricingMode: z.enum(["FLAT_HOURLY", "FIXED_DAILY"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = createLocationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const location = await db.parkingLocation.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        address: parsed.data.address,
        pricingMode: parsed.data.pricingMode,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        description: parsed.data.description,
      },
    });

    await db.locationAdmin.create({
      data: {
        userId: session.user.id,
        locationId: location.id,
        role: "OWNER",
      },
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (error: any) {
    if (
      error?.message?.includes("Unique constraint") ||
      error?.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 409 },
      );
    }
    throw error;
  }
}
