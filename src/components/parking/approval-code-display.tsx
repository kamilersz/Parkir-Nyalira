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
  const qrPayload = generateApprovalQRPayload(
    "ticket",
    approvalCode,
    timeoutCode,
  );

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Tiket Parkir",
        text: `Kode: ${formatApprovalDisplay(approvalCode, timeoutCode)} - ${licensePlate}`,
      });
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-600">Kode Approval</h2>
        <div className="mt-2 text-4xl font-bold tracking-widest">
          {approvalCode}
        </div>
        <div className="mt-1 text-4xl font-bold tracking-widest">
          {timeoutCode}
        </div>
        <div className="mt-2 text-2xl font-bold">
          {formatApprovalDisplay(approvalCode, timeoutCode)}
        </div>
      </div>

      <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(qrPayload)}`}
          alt="QR Kode Approval"
          className="h-44 w-44"
        />
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Plat</span>
          <span className="font-medium">{licensePlate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Lokasi</span>
          <span className="font-medium">{locationName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Jenis</span>
          <span className="font-medium">
            {vehicleTypeLabels[vehicleType] ?? vehicleType}
          </span>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        <span>
          Berlaku: {new Date(validFrom).toLocaleString("id-ID")} -{" "}
          {new Date(validUntil).toLocaleString("id-ID")}
        </span>
      </div>

      {isExpired && (
        <div className="rounded-lg bg-red-50 p-3 text-center font-medium text-red-600">
          Tiket telah kadaluarsa
        </div>
      )}

      <button
        onClick={handleShare}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Bagikan / Simpan
      </button>
    </div>
  );
}
