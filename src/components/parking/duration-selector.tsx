"use client";

import { useState } from "react";

interface DurationSelectorProps {
  pricingMode: "FLAT_HOURLY" | "FIXED_DAILY";
  selectedDuration: number | null;
  onDurationChange: (minutes: number) => void;
  dailyRate: number;
}

const hourlyPresets = [
  { label: "1 Jam", minutes: 60 },
  { label: "2 Jam", minutes: 120 },
  { label: "3 Jam", minutes: 180 },
  { label: "5 Jam", minutes: 300 },
  { label: "1 Hari", minutes: 1440 },
];

const dailyPresets = [{ label: "1 Hari", minutes: 1440 }];

export function DurationSelector({
  pricingMode,
  selectedDuration,
  onDurationChange,
  dailyRate: _dailyRate,
}: DurationSelectorProps) {
  const [customMinutes, setCustomMinutes] = useState("");

  const presets = pricingMode === "FIXED_DAILY" ? dailyPresets : hourlyPresets;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMinutes(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onDurationChange(num);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.minutes}
            onClick={() => onDurationChange(preset.minutes)}
            data-selected={
              selectedDuration === preset.minutes ? "true" : undefined
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selectedDuration === preset.minutes
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="custom-duration"
          className="block text-sm font-medium text-gray-700"
        >
          Durasi kustom (menit)
        </label>
        <input
          id="custom-duration"
          type="number"
          value={customMinutes}
          onChange={handleCustomChange}
          placeholder="Menit"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3"
          aria-label="Durasi kustom"
        />
      </div>
    </div>
  );
}
