"use client";

import { useState, useCallback, useEffect } from "react";
import { detectVehicleType } from "~/lib/plates";
import { VehicleTypeSelector } from "./vehicle-type-selector";

interface VehicleTypeRule {
  vehicleType: string;
  pattern: string;
  priority: number;
  isActive: boolean;
}

interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  onVehicleTypeDetected: (type: string | null) => void;
  vehicleRules: VehicleTypeRule[];
  selectedVehicleType: string | null;
  onVehicleTypeChange: (type: string) => void;
}

const vehicleTypeLabels: Record<string, string> = {
  MOTORCYCLE: "Motor",
  CAR: "Mobil",
  BUS: "Bus",
  TRUCK: "Truk",
};

const vehicleTypes = ["MOTORCYCLE", "CAR", "BUS", "TRUCK"] as const;

export function PlateInput({
  value,
  onChange,
  onVehicleTypeDetected,
  vehicleRules,
  selectedVehicleType,
  onVehicleTypeChange,
}: PlateInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [detectedType, setDetectedType] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      onChange(val);

      const detected = detectVehicleType(val, vehicleRules);
      setDetectedType(detected);
      onVehicleTypeDetected(detected);
    },
    [onChange, vehicleRules, onVehicleTypeDetected],
  );

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder="Masukkan plat nomor"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg uppercase"
          inputMode="text"
          autoComplete="off"
        />
        <p className="mt-1 text-sm text-gray-500">Contoh: B 1234 ABC</p>
      </div>

      {detectedType && (
        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Terdeteksi: {vehicleTypeLabels[detectedType] ?? detectedType}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Pilih Kendaraan
        </label>
        <VehicleTypeSelector
          value={selectedVehicleType}
          onChange={onVehicleTypeChange}
        />
      </div>
    </div>
  );
}
