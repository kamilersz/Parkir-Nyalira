"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "~/lib/pricing";

interface QRISDisplayProps {
  qrPayload: string;
  amount: number;
  expiresAt: string;
  onDownload: () => void;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
}

export function QRISDisplay({
  qrPayload,
  amount,
  expiresAt,
  onDownload,
  paymentStatus,
}: QRISDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutesLeft = Math.floor(timeLeft / 60);
  const isExpired = timeLeft <= 0 && paymentStatus === "PENDING";

  if (paymentStatus === "SUCCESS") {
    return (
      <div className="rounded-lg border bg-green-50 p-6 text-center">
        <div className="text-2xl font-bold text-green-600">
          Pembayaran Berhasil
        </div>
        <p className="mt-2 text-green-700">Mengalihkan ke tiket Anda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6 text-center">
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrPayload)}`}
          alt="QR QRIS"
          className="h-60 w-60"
        />
      </div>

      <div className="text-2xl font-bold">{formatRupiah(amount)}</div>

      {isExpired ? (
        <div className="rounded-lg bg-red-50 p-3 text-red-600">
          QR telah kadaluarsa
        </div>
      ) : (
        <p className="text-sm text-gray-500">{minutesLeft} menit tersisa</p>
      )}

      <button
        onClick={onDownload}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Unduh QR
      </button>

      <p className="text-xs text-gray-500">
        Scan QR ini menggunakan aplikasi e-wallet atau mobile banking Anda
      </p>
    </div>
  );
}
