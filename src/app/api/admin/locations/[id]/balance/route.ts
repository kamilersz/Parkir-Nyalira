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

  if (admin.role !== "OWNER") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const location = await db.parkingLocation.findUnique({
    where: { id },
    select: { id: true, name: true, balance: true },
  });

  if (!location) {
    return NextResponse.json(
      { error: "Lokasi tidak ditemukan" },
      { status: 404 },
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayStats = await db.parkingTicket.aggregate({
    _sum: { totalPrice: true },
    _count: true,
    where: {
      locationId: id,
      status: "PAID",
      paidAt: { gte: todayStart },
    },
  });

  return NextResponse.json({
    balance: location.balance,
    todayIncome: todayStats._sum.totalPrice ?? 0,
    todayTransactions: todayStats._count,
  });
}
