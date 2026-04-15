interface QRISPayloadInput {
  ticketId: string;
  amount: number;
  merchantName: string;
  locationName: string;
}

interface QRISPayloadOutput {
  ticketId: string;
  amount: number;
  merchantName: string;
  locationName: string;
  timestamp: string;
}

export function generateQRISPayload(input: QRISPayloadInput): string {
  const payload: QRISPayloadOutput = {
    ...input,
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function parseQRISPayload(payload: string): QRISPayloadOutput | null {
  try {
    const parsed = JSON.parse(payload);
    if (
      typeof parsed.ticketId === "string" &&
      typeof parsed.amount === "number" &&
      typeof parsed.merchantName === "string" &&
      typeof parsed.locationName === "string" &&
      typeof parsed.timestamp === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidQRISPayload(payload: string): boolean {
  if (!payload || payload.trim().length === 0) return false;

  const parsed = parseQRISPayload(payload);
  if (!parsed) return false;

  if (typeof parsed.ticketId !== "string" || parsed.ticketId.length === 0)
    return false;
  if (typeof parsed.amount !== "number") return false;
  if (typeof parsed.merchantName !== "string") return false;
  if (typeof parsed.locationName !== "string") return false;
  if (typeof parsed.timestamp !== "string") return false;

  return true;
}
