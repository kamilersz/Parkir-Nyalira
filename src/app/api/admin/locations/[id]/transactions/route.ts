import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";

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
  const admin = await db.locationAdmin.findFirst({
    where: { userId: session.user.id, locationId: id },
  });
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const vehicleType = url.searchParams.get("vehicleType");

  const where: any = { locationId: id };
  if (status) where.status = status;
  if (vehicleType) where.vehicleType = vehicleType;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + "T23:59:59.999Z");
  }

  const [transactions, total] = await Promise.all([
    db.parkingTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.parkingTicket.count({ where }),
  ]);

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
    },
  });
}
