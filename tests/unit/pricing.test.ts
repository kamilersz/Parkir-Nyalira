import { describe, it, expect } from "vitest";
import { calculatePrice, formatRupiah } from "~/lib/pricing";

describe("calculatePrice", () => {
  describe("FLAT_HOURLY mode", () => {
    it("charges firstHourRate for duration <= 60 minutes", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 60,
      });

      expect(result.total).toBe(10000);
      expect(result.firstHour).toBe(10000);
      expect(result.additionalHourCount).toBe(0);
      expect(result.additionalHours).toBe(0);
    });

    it("charges firstHourRate for duration < 60 minutes", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 30,
      });

      expect(result.total).toBe(10000);
    });

    it("charges first hour + 1 additional hour for 61-120 minutes", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 90,
      });

      expect(result.total).toBe(15000);
      expect(result.firstHour).toBe(10000);
      expect(result.additionalHourCount).toBe(1);
      expect(result.additionalHours).toBe(5000);
    });

    it("charges first hour + 2 additional hours for 121-180 minutes", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 150,
      });

      expect(result.total).toBe(20000);
      expect(result.additionalHourCount).toBe(2);
    });

    it("ceils partial additional hours (1.5 hours → 2 additional)", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 150,
      });

      expect(result.additionalHourCount).toBe(2);
    });

    it("caps at maxDailyRate when set", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: 50000,
        durationMinutes: 600,
      });

      expect(result.total).toBe(50000);
      expect(result.capped).toBe(true);
      expect(result.capAmount).toBe(50000);
    });

    it("does not cap when total is below maxDailyRate", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: 75000,
        durationMinutes: 120,
      });

      expect(result.total).toBe(15000);
      expect(result.capped).toBe(false);
      expect(result.capAmount).toBeNull();
    });

    it("handles motorcycle pricing correctly", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 3000,
        additionalHourRate: 2000,
        dailyRate: 25000,
        maxDailyRate: 25000,
        durationMinutes: 180,
      });

      expect(result.total).toBe(7000);
      expect(result.firstHour).toBe(3000);
      expect(result.additionalHourCount).toBe(2);
      expect(result.additionalHours).toBe(4000);
    });

    it("handles bus pricing correctly", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 20000,
        additionalHourRate: 10000,
        dailyRate: 150000,
        maxDailyRate: 150000,
        durationMinutes: 300,
      });

      expect(result.total).toBe(60000);
    });
  });

  describe("FIXED_DAILY mode", () => {
    it("charges the dailyRate regardless of duration", () => {
      const result = calculatePrice({
        pricingMode: "FIXED_DAILY",
        firstHourRate: 5000,
        additionalHourRate: 5000,
        dailyRate: 15000,
        maxDailyRate: null,
        durationMinutes: 1440,
      });

      expect(result.total).toBe(15000);
      expect(result.dailyRate).toBe(15000);
    });

    it("charges dailyRate even for short durations", () => {
      const result = calculatePrice({
        pricingMode: "FIXED_DAILY",
        firstHourRate: 5000,
        additionalHourRate: 5000,
        dailyRate: 15000,
        maxDailyRate: null,
        durationMinutes: 60,
      });

      expect(result.total).toBe(15000);
    });

    it("charges 2x dailyRate for 2-day duration", () => {
      const result = calculatePrice({
        pricingMode: "FIXED_DAILY",
        firstHourRate: 5000,
        additionalHourRate: 5000,
        dailyRate: 50000,
        maxDailyRate: null,
        durationMinutes: 2880,
      });

      expect(result.total).toBe(100000);
    });
  });

  describe("edge cases", () => {
    it("handles zero duration gracefully", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 0,
      });

      expect(result.total).toBe(0);
    });

    it("handles 1 minute duration as first hour", () => {
      const result = calculatePrice({
        pricingMode: "FLAT_HOURLY",
        firstHourRate: 10000,
        additionalHourRate: 5000,
        dailyRate: 75000,
        maxDailyRate: null,
        durationMinutes: 1,
      });

      expect(result.total).toBe(10000);
    });
  });
});

describe("formatRupiah", () => {
  it("formats 0 correctly", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("formats amounts under 1000", () => {
    expect(formatRupiah(500)).toBe("Rp 500");
  });

  it("formats thousands with dot separator", () => {
    expect(formatRupiah(10000)).toBe("Rp 10.000");
  });

  it("formats large amounts correctly", () => {
    expect(formatRupiah(150000)).toBe("Rp 150.000");
  });

  it("formats 1 million correctly", () => {
    expect(formatRupiah(1000000)).toBe("Rp 1.000.000");
  });

  it("formats amounts with mixed digits", () => {
    expect(formatRupiah(15500)).toBe("Rp 15.500");
  });
});
