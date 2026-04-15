export function generateApprovalCode(_ticketId: string): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateTimeoutCode(validUntil: Date): string {
  const ts = validUntil.getTime();
  const code = ((ts % 97) * 31 + (ts % 53)) % 10000;
  return String(code).padStart(4, "0");
}

export function formatApprovalDisplay(
  approvalCode: string,
  timeoutCode: string,
): string {
  return `${approvalCode} - ${timeoutCode}`;
}

export function generateApprovalQRPayload(
  ticketId: string,
  approvalCode: string,
  timeoutCode: string,
): string {
  return `PARKIR:${ticketId}:${approvalCode}:${timeoutCode}`;
}
