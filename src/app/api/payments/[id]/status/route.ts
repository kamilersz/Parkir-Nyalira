import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payment = await db.payment.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      paidAt: true,
    },
  });

  if (!payment) {
    return NextResponse.json(
      { error: "Pembayaran tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: payment.id,
    status: payment.status,
    paidAt: payment.paidAt,
  });
}
