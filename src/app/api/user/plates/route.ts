import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "~/server/better-auth/server";
import { normalizePlate, formatPlate } from "~/lib/plates";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  const plates = await db.licensePlateHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastUsedAt: "desc" },
  });

  return NextResponse.json({ plates });
}

const addPlateSchema = z.object({
  licensePlate: z.string().min(1),
  vehicleType: z.enum(["MOTORCYCLE", "CAR", "BUS", "TRUCK"]),
  label: z.string().optional(),
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
  const parsed = addPlateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedPlate = normalizePlate(parsed.data.licensePlate);
  const rawPlate = formatPlate(normalizedPlate);

  const existing = await db.licensePlateHistory.findUnique({
    where: {
      userId_licensePlate: {
        userId: session.user.id,
        licensePlate: normalizedPlate,
      },
    },
  });

  if (existing) {
    const updated = await db.licensePlateHistory.update({
      where: { id: existing.id },
      data: {
        vehicleType: parsed.data.vehicleType,
        label: parsed.data.label ?? existing.label,
        useCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    return NextResponse.json({ plate: updated });
  }

  const plate = await db.licensePlateHistory.create({
    data: {
      userId: session.user.id,
      licensePlate: normalizedPlate,
      licensePlateRaw: rawPlate,
      vehicleType: parsed.data.vehicleType,
      label: parsed.data.label,
    },
  });

  return NextResponse.json({ plate }, { status: 201 });
}
