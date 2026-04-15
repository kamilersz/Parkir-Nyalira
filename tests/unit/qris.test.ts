import { describe, it, expect } from "vitest";
import {
  generateQRISPayload,
  parseQRISPayload,
  isValidQRISPayload,
} from "~/lib/qris";

describe("generateQRISPayload", () => {
  it("generates a valid JSON string", () => {
    const payload = generateQRISPayload({
      ticketId: "ticket-1",
      amount: 15000,
      merchantName: "Parkir Nyalira",
      locationName: "Parkir Mall XYZ",
    });

    expect(() => JSON.parse(payload)).not.toThrow();
  });

  it("includes all required fields in payload", () => {
    const payload = generateQRISPayload({
      ticketId: "ticket-1",
      amount: 15000,
      merchantName: "Parkir Nyalira",
      locationName: "Parkir Mall XYZ",
    });

    const parsed = JSON.parse(payload);
    expect(parsed).toHaveProperty("ticketId", "ticket-1");
    expect(parsed).toHaveProperty("amount", 15000);
    expect(parsed).toHaveProperty("merchantName", "Parkir Nyalira");
    expect(parsed).toHaveProperty("locationName", "Parkir Mall XYZ");
    expect(parsed).toHaveProperty("timestamp");
  });

  it("generates a timestamp close to now", () => {
    const before = Date.now();
    const payload = generateQRISPayload({
      ticketId: "ticket-1",
      amount: 10000,
      merchantName: "Test",
      locationName: "Test Location",
    });
    const after = Date.now();

    const parsed = JSON.parse(payload);
    const ts = new Date(parsed.timestamp).getTime();

    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("handles zero amount", () => {
    const payload = generateQRISPayload({
      ticketId: "ticket-free",
      amount: 0,
      merchantName: "Free",
      locationName: "Free Lot",
    });

    const parsed = JSON.parse(payload);
    expect(parsed.amount).toBe(0);
  });
});

describe("parseQRISPayload", () => {
  it("parses a valid QRIS payload string", () => {
    const payload = generateQRISPayload({
      ticketId: "ticket-1",
      amount: 15000,
      merchantName: "Parkir Nyalira",
      locationName: "Parkir Mall XYZ",
    });

    const parsed = parseQRISPayload(payload);

    expect(parsed.ticketId).toBe("ticket-1");
    expect(parsed.amount).toBe(15000);
    expect(parsed.merchantName).toBe("Parkir Nyalira");
    expect(parsed.locationName).toBe("Parkir Mall XYZ");
  });

  it("returns null for invalid JSON", () => {
    const result = parseQRISPayload("not-json");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    const result = parseQRISPayload("");
    expect(result).toBeNull();
  });
});

describe("isValidQRISPayload", () => {
  it("returns true for valid payload", () => {
    const payload = generateQRISPayload({
      ticketId: "ticket-1",
      amount: 15000,
      merchantName: "Parkir Nyalira",
      locationName: "Parkir Mall XYZ",
    });

    expect(isValidQRISPayload(payload)).toBe(true);
  });

  it("returns false for invalid JSON string", () => {
    expect(isValidQRISPayload("not-json")).toBe(false);
  });

  it("returns false for JSON missing required fields", () => {
    expect(isValidQRISPayload('{"foo":"bar"}')).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidQRISPayload("")).toBe(false);
  });

  it("returns false for payload with wrong amount type", () => {
    const badPayload = JSON.stringify({
      ticketId: "t-1",
      amount: "not-a-number",
      merchantName: "Test",
      locationName: "Test",
      timestamp: new Date().toISOString(),
    });

    expect(isValidQRISPayload(badPayload)).toBe(false);
  });
});
