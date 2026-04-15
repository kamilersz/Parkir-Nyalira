import { vi } from "vitest";

let mockDb: Record<string, any>;

export function setupApiTest() {
  vi.clearAllMocks();
  return mockDb as unknown as ReturnType<
    typeof import("./prisma-mock").createPrismaMock
  >;
}

export function setMockDb(db: Record<string, any>) {
  mockDb = db;
}

export function createNextRequest(
  url: string,
  options?: RequestInit & { params?: Record<string, string> },
) {
  const { params, ...init } = options ?? {};
  const request = new Request(new URL(url, "http://localhost:3000"), init);
  return { request, params };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
