import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePrice } from "~/lib/pricing";
import { normalizePlate, formatPlate } from "~/lib/plates";
import { generateQRISPayload } from "~/lib/qris";

const createTicketSchema = z.object({
  locationSlug: z.string().min(1),
  licensePlate: z.string().min(1),
  vehicleType: z.enum(["MOTORCYCLE", "CAR", "BUS", "TRUCK"]),
  durationMinutes: z.number().int().positive(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { locationSlug, licensePlate, vehicleType, durationMinutes } =
    parsed.data;

  const location = await db.parkingLocation.findUnique({
    where: { slug: locationSlug },
    include: {
      pricingTiers: { where: { isActive: true } },
      vehicleTypeRules: { where: { isActive: true } },
    },
  });

  if (!location || !location.isActive) {
    return NextResponse.json(
      { error: "Lokasi tidak ditemukan" },
      { status: 404 },
    );
  }

  const tier = location.pricingTiers.find(
    (t: any) => t.vehicleType === vehicleType,
  );

  if (!tier) {
    return NextResponse.json(
      { error: "Jenis kendaraan tidak didukung di lokasi ini" },
      { status: 400 },
    );
  }

  const breakdown = calculatePrice({
    pricingMode: location.pricingMode as "FLAT_HOURLY" | "FIXED_DAILY",
    firstHourRate: tier.firstHourRate,
    additionalHourRate: tier.additionalHourRate,
    dailyRate: tier.dailyRate,
    maxDailyRate: tier.maxDailyRate,
    durationMinutes,
  });

  const normalizedPlate = normalizePlate(licensePlate);
  const rawPlate = formatPlate(normalizedPlate);

  const ticket = await db.parkingTicket.create({
    data: {
      locationId: location.id,
      licensePlate: normalizedPlate,
      licensePlateRaw: rawPlate,
      vehicleType,
      durationMinutes,
      totalPrice: breakdown.total,
      status: "PENDING",
    },
  });

  const qrisExpiry = new Date(Date.now() + 15 * 60 * 1000);

  const payment = await db.payment.create({
    data: {
      ticketId: ticket.id,
      amount: breakdown.total,
      qrisPayload: generateQRISPayload({
        ticketId: ticket.id,
        amount: breakdown.total,
        merchantName: "Parkir Nyalira",
        locationName: location.name,
      }),
      qrisExpiry,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ticket, payment }, { status: 201 });
}
