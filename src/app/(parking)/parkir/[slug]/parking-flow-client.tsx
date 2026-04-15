"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlateInput } from "~/components/parking/plate-input";
import { DurationSelector } from "~/components/parking/duration-selector";
import { PriceSummary } from "~/components/parking/price-summary";
import { QRISDisplay } from "~/components/parking/qris-display";
import { calculatePrice, formatRupiah } from "~/lib/pricing";

interface VehicleTypeRule {
  vehicleType: string;
  pattern: string;
  priority: number;
  isActive: boolean;
}

interface PricingTier {
  id: string;
  vehicleType: string;
  firstHourRate: number;
  additionalHourRate: number;
  dailyRate: number;
  maxDailyRate: number | null;
  gracePeriodMinutes: number;
  isActive: boolean;
}

interface LocationData {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  pricingMode: "FLAT_HOURLY" | "FIXED_DAILY";
}

type Step = "plate" | "duration" | "confirm" | "payment" | "done";

interface ParkingFlowProps {
  location: LocationData;
  pricingTiers: PricingTier[];
  vehicleTypeRules: VehicleTypeRule[];
}

export function ParkingFlow({
  location,
  pricingTiers,
  vehicleTypeRules,
}: ParkingFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("plate");
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrisPayload, setQrisPayload] = useState<string | null>(null);
  const [qrisExpiry, setQrisExpiry] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED"
  >("PENDING");

  const activeTier = vehicleType
    ? pricingTiers.find((t) => t.vehicleType === vehicleType)
    : null;

  const breakdown =
    activeTier && duration
      ? calculatePrice({
          pricingMode: location.pricingMode,
          firstHourRate: activeTier.firstHourRate,
          additionalHourRate: activeTier.additionalHourRate,
          dailyRate: activeTier.dailyRate,
          maxDailyRate: activeTier.maxDailyRate,
          durationMinutes: duration,
        })
      : null;

  const canProceedPlate = plate.trim().length > 0 && vehicleType !== null;
  const canProceedDuration = duration !== null && duration > 0;

  const handleVehicleTypeDetected = useCallback((type: string | null) => {
    if (type) setVehicleType(type);
  }, []);

  const handleVehicleTypeChange = useCallback((type: string) => {
    setVehicleType(type);
  }, []);

  const handlePay = async () => {
    if (!vehicleType || !duration) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug: location.slug,
          licensePlate: plate,
          vehicleType,
          durationMinutes: duration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan");
        return;
      }

      setTicketId(data.ticket.id);
      setPaymentId(data.payment.id);
      setQrisPayload(data.payment.qrisPayload);
      setQrisExpiry(data.payment.qrisExpiry);
      setPaymentAmount(data.payment.amount);
      setStep("payment");
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step !== "payment" || !paymentId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}/status`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          setPaymentStatus("SUCCESS");
          setTimeout(() => {
            if (ticketId) router.push(`/tiket/${ticketId}`);
          }, 1500);
          return;
        }

        if (data.status === "FAILED" || data.status === "EXPIRED") {
          setPaymentStatus(data.status);
          return;
        }
      } catch {}
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [step, paymentId, ticketId, router]);

  const handleDownloadQR = async () => {
    if (!qrisPayload) return;

    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(qrisPayload, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
      });

      const link = document.createElement("a");
      link.download = `parkir-${ticketId ?? "qr"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {}
  };

  const stepOrder: Step[] = ["plate", "duration", "confirm", "payment", "done"];
  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <div className="space-y-6">
      {location && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold">{location.name}</h1>
          {location.address && (
            <p className="text-sm text-gray-500">{location.address}</p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "plate" && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">
              Langkah 1: Plat Nomor
            </h2>
            <p className="text-sm text-gray-500">
              Masukkan plat nomor kendaraan Anda
            </p>
          </div>

          <PlateInput
            value={plate}
            onChange={setPlate}
            onVehicleTypeDetected={handleVehicleTypeDetected}
            vehicleRules={vehicleTypeRules}
            selectedVehicleType={vehicleType}
            onVehicleTypeChange={handleVehicleTypeChange}
          />

          <button
            onClick={() => setStep("duration")}
            disabled={!canProceedPlate}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lanjutkan
          </button>
        </div>
      )}

      {step === "duration" && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Langkah 2: Durasi</h2>
            <p className="text-sm text-gray-500">
              Pilih berapa lama Anda akan parkir
            </p>
          </div>

          <DurationSelector
            pricingMode={location.pricingMode}
            selectedDuration={duration}
            onDurationChange={setDuration}
            dailyRate={activeTier?.dailyRate ?? 0}
          />

          {breakdown && (
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-600">Estimasi biaya</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatRupiah(breakdown.total)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("plate")}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              onClick={() => setStep("confirm")}
              disabled={!canProceedDuration}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && breakdown && vehicleType && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">
              Langkah 3: Konfirmasi
            </h2>
            <p className="text-sm text-gray-500">
              Periksa kembali detail parkir Anda
            </p>
          </div>

          <PriceSummary
            locationName={location.name}
            licensePlate={plate}
            vehicleType={vehicleType}
            durationMinutes={duration!}
            pricingMode={location.pricingMode}
            breakdown={breakdown}
            onPay={handlePay}
            isLoading={isSubmitting}
          />

          <button
            onClick={() => setStep("duration")}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Kembali
          </button>
        </div>
      )}

      {step === "payment" && qrisPayload && qrisExpiry && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">
              Langkah 4: Pembayaran
            </h2>
            <p className="text-sm text-gray-500">
              Scan QR code di bawah menggunakan aplikasi e-wallet atau mobile
              banking Anda
            </p>
          </div>

          <QRISDisplay
            qrPayload={qrisPayload}
            amount={paymentAmount}
            expiresAt={qrisExpiry}
            onDownload={handleDownloadQR}
            paymentStatus={paymentStatus}
          />
        </div>
      )}
    </div>
  );
}
