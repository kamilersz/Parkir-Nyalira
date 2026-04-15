import { describe, it, expect } from "vitest";
import {
  normalizePlate,
  formatPlate,
  detectVehicleType,
  validatePlate,
} from "~/lib/plates";

describe("normalizePlate", () => {
  it("removes spaces and converts to uppercase", () => {
    expect(normalizePlate("b 1234 abc")).toBe("B1234ABC");
  });

  it("removes dashes", () => {
    expect(normalizePlate("B-1234-ABC")).toBe("B1234ABC");
  });

  it("removes mixed spaces and dashes", () => {
    expect(normalizePlate("B - 12 34 - AB C")).toBe("B1234ABC");
  });

  it("handles already normalized plates", () => {
    expect(normalizePlate("B1234ABC")).toBe("B1234ABC");
  });

  it("handles single letter area code", () => {
    expect(normalizePlate("D 123 AB")).toBe("D123AB");
  });

  it("handles two letter area code", () => {
    expect(normalizePlate("KT 5678 XY")).toBe("KT5678XY");
  });

  it("trims whitespace", () => {
    expect(normalizePlate("  B 1234 ABC  ")).toBe("B1234ABC");
  });
});

describe("formatPlate", () => {
  it("formats standard car plate", () => {
    expect(formatPlate("B1234ABC")).toBe("B 1234 ABC");
  });

  it("formats motorcycle plate (2 trailing letters)", () => {
    expect(formatPlate("B1234AB")).toBe("B 1234 AB");
  });

  it("formats short plate", () => {
    expect(formatPlate("D123A")).toBe("D 123 A");
  });

  it("handles single letter suffix", () => {
    expect(formatPlate("B1234A")).toBe("B 1234 A");
  });

  it("handles two letter area code", () => {
    expect(formatPlate("KT5678XY")).toBe("KT 5678 XY");
  });
});

describe("detectVehicleType", () => {
  const rules = [
    {
      vehicleType: "BUS" as const,
      pattern: "^BX\\d{4}[A-Z]{3}$",
      priority: 30,
      isActive: true,
    },
    {
      vehicleType: "CAR" as const,
      pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{3}$",
      priority: 20,
      isActive: true,
    },
    {
      vehicleType: "MOTORCYCLE" as const,
      pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{0,2}$",
      priority: 10,
      isActive: true,
    },
  ];

  it("detects car plate (3 trailing letters)", () => {
    const result = detectVehicleType("B 1234 ABC", rules);
    expect(result).toBe("CAR");
  });

  it("detects motorcycle plate (0-2 trailing letters)", () => {
    const result = detectVehicleType("B 1234 AB", rules);
    expect(result).toBe("MOTORCYCLE");
  });

  it("detects motorcycle plate with no trailing letters", () => {
    const result = detectVehicleType("B 1234", rules);
    expect(result).toBe("MOTORCYCLE");
  });

  it("detects bus plate matching bus pattern (higher priority)", () => {
    const result = detectVehicleType("B 1234 AB", [
      {
        vehicleType: "BUS" as const,
        pattern: "^[A-Z]\\d{3,4}[A-Z]{2}$",
        priority: 30,
        isActive: true,
      },
      {
        vehicleType: "MOTORCYCLE" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{0,2}$",
        priority: 10,
        isActive: true,
      },
    ]);
    expect(result).toBe("BUS");
  });

  it("returns null when no rules match", () => {
    const result = detectVehicleType("XYZ12345", rules);
    expect(result).toBeNull();
  });

  it("skips inactive rules", () => {
    const result = detectVehicleType("B 1234 ABC", [
      {
        vehicleType: "CAR" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{3}$",
        priority: 20,
        isActive: false,
      },
    ]);
    expect(result).toBeNull();
  });

  it("checks higher priority rules first", () => {
    const result = detectVehicleType("B1234AB", [
      {
        vehicleType: "CAR" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{2}$",
        priority: 5,
        isActive: true,
      },
      {
        vehicleType: "MOTORCYCLE" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{2}$",
        priority: 10,
        isActive: true,
      },
    ]);
    expect(result).toBe("MOTORCYCLE");
  });

  it("handles empty rules array", () => {
    const result = detectVehicleType("B 1234 ABC", []);
    expect(result).toBeNull();
  });

  it("handles two-letter area code plate", () => {
    const result = detectVehicleType("KT 5678 XYZ", rules);
    expect(result).toBe("CAR");
  });
});

describe("validatePlate", () => {
  it("accepts valid Indonesian plate format", () => {
    expect(validatePlate("B 1234 ABC")).toBe(true);
  });

  it("accepts valid motorcycle plate", () => {
    expect(validatePlate("B 1234 AB")).toBe(true);
  });

  it("accepts valid plate without spaces", () => {
    expect(validatePlate("B1234ABC")).toBe(true);
  });

  it("accepts two-letter area code", () => {
    expect(validatePlate("KT 5678 XY")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(validatePlate("")).toBe(false);
  });

  it("rejects plates with special characters", () => {
    expect(validatePlate("B 1234 @BC")).toBe(false);
  });

  it("rejects plates that are only numbers", () => {
    expect(validatePlate("12345678")).toBe(false);
  });

  it("rejects plates that are only letters", () => {
    expect(validatePlate("ABCDEFGH")).toBe(false);
  });
});
