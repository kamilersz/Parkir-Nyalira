import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "~/server/better-auth/server";

async function requireAdmin(
  userId: string,
  locationId: string,
  minRole: "OWNER" | "OPERATOR" = "OPERATOR",
) {
  const admin = await db.locationAdmin.findFirst({
    where: { userId, locationId },
  });
  if (!admin) return null;
  if (minRole === "OWNER" && admin.role !== "OWNER") return "FORBIDDEN";
  return admin;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const admin = await requireAdmin(session.user.id, id);
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const tiers = await db.pricingTier.findMany({
    where: { locationId: id },
  });

  return NextResponse.json({ tiers });
}

const createTierSchema = z.object({
  vehicleType: z.enum(["MOTORCYCLE", "CAR", "BUS", "TRUCK"]),
  firstHourRate: z.number().int().min(0),
  additionalHourRate: z.number().int().min(0),
  dailyRate: z.number().int().min(0),
  maxDailyRate: z.number().int().min(0).nullable().optional(),
  gracePeriodMinutes: z.number().int().min(0).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const admin = await requireAdmin(session.user.id, id, "OWNER");
  if (!admin || admin === "FORBIDDEN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.pricingTier.findFirst({
    where: { locationId: id, vehicleType: parsed.data.vehicleType },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Tarif untuk jenis kendaraan ini sudah ada" },
      { status: 409 },
    );
  }

  const tier = await db.pricingTier.create({
    data: {
      locationId: id,
      vehicleType: parsed.data.vehicleType,
      firstHourRate: parsed.data.firstHourRate,
      additionalHourRate: parsed.data.additionalHourRate,
      dailyRate: parsed.data.dailyRate,
      maxDailyRate: parsed.data.maxDailyRate ?? parsed.data.dailyRate,
      gracePeriodMinutes: parsed.data.gracePeriodMinutes ?? 15,
    },
  });

  return NextResponse.json({ tier }, { status: 201 });
}
