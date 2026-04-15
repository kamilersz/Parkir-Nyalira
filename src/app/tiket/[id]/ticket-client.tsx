"use client";

import {
  generateApprovalQRPayload,
  formatApprovalDisplay,
} from "~/lib/approval-code";

interface ApprovalCodeDisplayProps {
  approvalCode: string;
  timeoutCode: string;
  validFrom: string;
  validUntil: string;
  licensePlate: string;
  locationName: string;
  vehicleType: string;
}

const vehicleTypeLabels: Record<string, string> = {
  MOTORCYCLE: "Motor",
  CAR: "Mobil",
  BUS: "Bus",
  TRUCK: "Truk",
};

export function ApprovalCodeDisplay({
  approvalCode,
  timeoutCode,
  validFrom,
  validUntil,
  licensePlate,
  locationName,
  vehicleType,
}: ApprovalCodeDisplayProps) {
  const isExpired = new Date(validUntil).getTime() < Date.now();
  const displayCode = formatApprovalDisplay(approvalCode, timeoutCode);
  const qrPayload = generateApprovalQRPayload(
    "ticket",
    approvalCode,
    timeoutCode,
  );

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Tiket Parkir",
        text: `Kode: ${displayCode} - ${licensePlate} - ${locationName}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Kode Approval
          </h2>
          <div className="mt-3 text-5xl font-bold tracking-[0.3em] text-gray-900">
            {displayCode}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Tunjukkan kode ini saat keluar
          </p>
        </div>

        <hr className="my-5" />

        <div className="flex justify-center">
          <div className="rounded-lg border bg-white p-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload)}`}
              alt="QR Approval"
              className="h-48 w-48"
            />
          </div>
        </div>

        <hr className="my-5" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plat Nomor</span>
            <span className="font-semibold">{licensePlate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lokasi</span>
            <span className="font-semibold">{locationName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Jenis</span>
            <span className="font-semibold">
              {vehicleTypeLabels[vehicleType] ?? vehicleType}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Berlaku</span>
            <span className="font-semibold">
              {new Date(validFrom).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              —{" "}
              {new Date(validUntil).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="font-medium text-red-700">Tiket telah kadaluarsa</p>
        </div>
      )}

      <button
        onClick={handleShare}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Bagikan / Simpan Tiket
      </button>
    </div>
  );
}
