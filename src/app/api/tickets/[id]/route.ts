import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ticket = await db.parkingTicket.findUnique({
    where: { id },
    include: { location: { select: { name: true, slug: true } } },
  });

  if (!ticket) {
    return NextResponse.json(
      { error: "Tiket tidak ditemukan" },
      { status: 404 },
    );
  }

  const { location, ...ticketData } = ticket;

  return NextResponse.json({
    ticket: {
      ...ticketData,
      locationName: location.name,
    },
  });
}
