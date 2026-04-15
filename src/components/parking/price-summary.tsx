"use client";

import { formatRupiah } from "~/lib/pricing";

interface PriceBreakdown {
  firstHour: number;
  additionalHours: number;
  additionalHourCount: number;
  dailyRate: number;
  total: number;
  capped: boolean;
  capAmount: number | null;
}

interface PriceSummaryProps {
  locationName: string;
  licensePlate: string;
  vehicleType: string;
  durationMinutes: number;
  pricingMode: "FLAT_HOURLY" | "FIXED_DAILY";
  breakdown: PriceBreakdown;
  onPay: () => void;
  isLoading: boolean;
}

const vehicleTypeLabels: Record<string, string> = {
  MOTORCYCLE: "Motor",
  CAR: "Mobil",
  BUS: "Bus",
  TRUCK: "Truk",
};

function formatDuration(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    const remaining = minutes % 1440;
    const hours = Math.floor(remaining / 60);
    if (hours > 0) return `${days} hari ${hours} jam`;
    return `${days} hari`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins > 0) return `${hours} jam ${mins} menit`;
  return `${hours} jam`;
}

export function PriceSummary({
  locationName,
  licensePlate,
  vehicleType,
  durationMinutes,
  pricingMode,
  breakdown,
  onPay,
  isLoading,
}: PriceSummaryProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <h2 className="text-xl font-bold">{locationName}</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Plat Nomor</span>
          <span className="font-medium">{licensePlate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Jenis Kendaraan</span>
          <span className="font-medium">
            {vehicleTypeLabels[vehicleType] ?? vehicleType}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Durasi</span>
          <span className="font-medium">{formatDuration(durationMinutes)}</span>
        </div>
      </div>

      <hr />

      <div className="space-y-2 text-sm">
        {pricingMode === "FIXED_DAILY" ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Tarif harian</span>
            <span>{formatRupiah(breakdown.dailyRate)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Jam pertama</span>
              <span>{formatRupiah(breakdown.firstHour)}</span>
            </div>
            {breakdown.additionalHourCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {breakdown.additionalHourCount} jam tambahan
                </span>
                <span>{formatRupiah(breakdown.additionalHours)}</span>
              </div>
            )}
          </>
        )}

        {breakdown.capped && (
          <div className="flex justify-between text-orange-600">
            <span>Tarif maks</span>
            <span>{formatRupiah(breakdown.capAmount!)}</span>
          </div>
        )}
      </div>

      <hr />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatRupiah(breakdown.total)}</span>
      </div>

      <button
        onClick={onPay}
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}
