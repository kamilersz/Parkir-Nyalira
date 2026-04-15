import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import { ApprovalCodeDisplay } from "./ticket-client";

export const revalidate = 0;

export default async function TiketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await db.parkingTicket.findUnique({
    where: { id },
    include: { location: { select: { name: true, slug: true } } },
  });

  if (!ticket) {
    notFound();
  }

  if (ticket.status !== "PAID") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-2xl">
            ⏳
          </div>
          <h1 className="text-xl font-bold">Menunggu Pembayaran</h1>
          <p className="mt-2 text-gray-500">
            Tiket ini belum dibayar. Silakan selesaikan pembayaran terlebih
            dahulu.
          </p>
          {ticket.status === "PENDING" && (
            <p className="mt-4 text-sm text-gray-400">
              Plat: {ticket.licensePlateRaw} · {ticket.durationMinutes} menit ·{" "}
              Rp {ticket.totalPrice.toLocaleString("id-ID")}
            </p>
          )}
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Link href="/" className="text-lg font-bold text-blue-700">
            ← Parkir Nyalira
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6 pb-24">
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-center">
          <p className="text-sm font-medium text-green-700">
            Pembayaran berhasil
          </p>
          <p className="text-xs text-green-600">
            {ticket.location.name} ·{" "}
            {ticket.paidAt
              ? new Date(ticket.paidAt).toLocaleString("id-ID")
              : ""}
          </p>
        </div>

        <ApprovalCodeDisplay
          approvalCode={ticket.approvalCode ?? ""}
          timeoutCode={ticket.timeoutCode ?? ""}
          validFrom={ticket.validFrom?.toISOString() ?? ""}
          validUntil={ticket.validUntil?.toISOString() ?? ""}
          licensePlate={ticket.licensePlateRaw}
          locationName={ticket.location.name}
          vehicleType={ticket.vehicleType}
        />
      </main>
    </div>
  );
}
