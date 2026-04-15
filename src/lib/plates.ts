interface VehicleTypeRule {
  vehicleType: string;
  pattern: string;
  priority: number;
  isActive: boolean;
}

export function normalizePlate(plate: string): string {
  return plate.trim().replace(/[\s-]/g, "").toUpperCase();
}

export function formatPlate(normalized: string): string {
  const match = normalized.match(/^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/);
  if (!match || !match[1] || !match[2]) return normalized;

  const parts = [match[1], match[2]];
  if (match[3]) {
    parts.push(match[3]);
  }

  return parts.join(" ");
}

export function detectVehicleType(
  plate: string,
  rules: VehicleTypeRule[],
): string | null {
  const normalized = normalizePlate(plate);

  const activeRules = rules
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of activeRules) {
    try {
      const regex = new RegExp(rule.pattern);
      if (regex.test(normalized)) {
        return rule.vehicleType;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function validatePlate(plate: string): boolean {
  if (!plate || plate.trim().length === 0) return false;

  const normalized = normalizePlate(plate);

  if (/[^A-Z0-9]/.test(normalized)) return false;

  if (/^\d+$/.test(normalized)) return false;
  if (/^[A-Z]+$/.test(normalized)) return false;

  const isValid = /^[A-Z]{1,2}\d{1,4}[A-Z]{0,4}$/.test(normalized);
  return isValid;
}
