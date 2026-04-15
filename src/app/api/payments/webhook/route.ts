import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateApprovalCode, generateTimeoutCode } from "~/lib/approval-code";

const webhookSchema = z.object({
  ticketId: z.string().min(1),
  paymentId: z.string().min(1),
  status: z.enum(["SUCCESS", "FAILED"]),
  amount: z.number().int().positive(),
  paidAt: z.string(),
  signature: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = webhookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ticketId, paymentId, amount, paidAt } = parsed.data;

  const payment = await db.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    return NextResponse.json(
      { error: "Pembayaran tidak ditemukan" },
      { status: 404 },
    );
  }

  if (payment.status === "SUCCESS") {
    return NextResponse.json(
      { error: "Pembayaran sudah diproses" },
      { status: 400 },
    );
  }

  if (payment.amount !== amount) {
    return NextResponse.json(
      { error: "Jumlah pembayaran tidak sesuai" },
      { status: 400 },
    );
  }

  const ticket = await db.parkingTicket.findUnique({ where: { id: ticketId } });

  if (!ticket) {
    return NextResponse.json(
      { error: "Tiket tidak ditemukan" },
      { status: 404 },
    );
  }

  const paidAtDate = new Date(paidAt);
  const validUntil = new Date(
    paidAtDate.getTime() + ticket.durationMinutes * 60 * 1000,
  );
  const approvalCode = generateApprovalCode(ticket.id);
  const timeoutCode = generateTimeoutCode(validUntil);

  const result = await db.$transaction(async (tx: any) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        paidAt: paidAtDate,
        webhookPayload: JSON.stringify(body),
        webhookSignature: parsed.data.signature ?? null,
      },
    });

    const updatedTicket = await tx.parkingTicket.update({
      where: { id: ticketId },
      data: {
        status: "PAID",
        approvalCode,
        timeoutCode,
        validFrom: paidAtDate,
        validUntil,
        paidAt: paidAtDate,
      },
    });

    await tx.parkingLocation.update({
      where: { id: ticket.locationId },
      data: { balance: { increment: amount } },
    });

    return { payment: updatedPayment, ticket: updatedTicket };
  });

  return NextResponse.json({
    success: true,
    ticket: result.ticket,
  });
}
