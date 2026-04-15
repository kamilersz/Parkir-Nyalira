export interface PriceInput {
  pricingMode: "FLAT_HOURLY" | "FIXED_DAILY";
  firstHourRate: number;
  additionalHourRate: number;
  dailyRate: number;
  maxDailyRate: number | null;
  durationMinutes: number;
}

export interface PriceBreakdown {
  firstHour: number;
  additionalHours: number;
  additionalHourCount: number;
  dailyRate: number;
  total: number;
  capped: boolean;
  capAmount: number | null;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const {
    pricingMode,
    firstHourRate,
    additionalHourRate,
    dailyRate,
    maxDailyRate,
    durationMinutes,
  } = input;

  if (durationMinutes <= 0) {
    return {
      firstHour: 0,
      additionalHours: 0,
      additionalHourCount: 0,
      dailyRate: 0,
      total: 0,
      capped: false,
      capAmount: null,
    };
  }

  if (pricingMode === "FIXED_DAILY") {
    const dayCount = Math.max(1, Math.ceil(durationMinutes / 1440));
    const total = dailyRate * dayCount;
    return {
      firstHour: 0,
      additionalHours: 0,
      additionalHourCount: 0,
      dailyRate,
      total,
      capped: false,
      capAmount: null,
    };
  }

  const firstHour = firstHourRate;
  const remainingMinutes = Math.max(0, durationMinutes - 60);
  const additionalHourCount = Math.ceil(remainingMinutes / 60);
  const additionalHours = additionalHourCount * additionalHourRate;

  let total = firstHour + additionalHours;
  let capped = false;

  if (maxDailyRate !== null && total > maxDailyRate) {
    total = maxDailyRate;
    capped = true;
  }

  return {
    firstHour,
    additionalHours,
    additionalHourCount,
    dailyRate,
    total,
    capped,
    capAmount: capped ? maxDailyRate : null,
  };
}

export function formatRupiah(amount: number): string {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
}
