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

  const location = await db.parkingLocation.findUnique({ where: { id } });
  if (!location) {
    return NextResponse.json(
      { error: "Lokasi tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ location });
}

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  pricingMode: z.enum(["FLAT_HOURLY", "FIXED_DAILY"]).optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export async function PATCH(
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
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  if (admin === "FORBIDDEN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const location = await db.parkingLocation.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ location });
}
