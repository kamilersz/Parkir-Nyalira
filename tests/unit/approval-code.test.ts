import { describe, it, expect } from "vitest";
import {
  generateApprovalCode,
  generateTimeoutCode,
  formatApprovalDisplay,
  generateApprovalQRPayload,
} from "~/lib/approval-code";

describe("generateApprovalCode", () => {
  it("generates a 4-digit string", () => {
    const code = generateApprovalCode("ticket-1");
    expect(code).toHaveLength(4);
    expect(code).toMatch(/^\d{4}$/);
  });

  it("generates different codes for different tickets", () => {
    const code1 = generateApprovalCode("ticket-1");
    const code2 = generateApprovalCode("ticket-2");

    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateApprovalCode(`ticket-${i}`));
    }
    expect(codes.size).toBeGreaterThan(80);
  });

  it("generates code in range 1000-9999", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateApprovalCode(`ticket-${i}`);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(1000);
      expect(num).toBeLessThanOrEqual(9999);
    }
  });
});

describe("generateTimeoutCode", () => {
  it("generates a 4-digit string from validUntil date", () => {
    const validUntil = new Date("2026-04-15T12:05:00Z");
    const code = generateTimeoutCode(validUntil);

    expect(code).toHaveLength(4);
    expect(code).toMatch(/^\d{4}$/);
  });

  it("is deterministic — same input gives same output", () => {
    const validUntil = new Date("2026-04-15T12:05:00Z");
    const code1 = generateTimeoutCode(validUntil);
    const code2 = generateTimeoutCode(validUntil);

    expect(code1).toBe(code2);
  });

  it("produces different codes for different timestamps", () => {
    const date1 = new Date("2026-04-15T12:05:00Z");
    const date2 = new Date("2026-04-15T13:05:00Z");

    const code1 = generateTimeoutCode(date1);
    const code2 = generateTimeoutCode(date2);

    expect(code1).not.toBe(code2);
  });
});

describe("formatApprovalDisplay", () => {
  it("formats approval and timeout codes with separator", () => {
    const result = formatApprovalDisplay("4827", "6301");
    expect(result).toBe("4827 - 6301");
  });

  it("handles leading zeros in codes", () => {
    const result = formatApprovalDisplay("0042", "0010");
    expect(result).toBe("0042 - 0010");
  });
});

describe("generateApprovalQRPayload", () => {
  it("generates correct payload format", () => {
    const payload = generateApprovalQRPayload("ticket-1", "4827", "6301");

    expect(payload).toBe("PARKIR:ticket-1:4827:6301");
  });

  it("prefixes with PARKIR:", () => {
    const payload = generateApprovalQRPayload("t-1", "0000", "0000");
    expect(payload.startsWith("PARKIR:")).toBe(true);
  });

  it("includes all parts separated by colons", () => {
    const payload = generateApprovalQRPayload("abc", "1234", "5678");
    const parts = payload.split(":");

    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("PARKIR");
    expect(parts[1]).toBe("abc");
    expect(parts[2]).toBe("1234");
    expect(parts[3]).toBe("5678");
  });
});
