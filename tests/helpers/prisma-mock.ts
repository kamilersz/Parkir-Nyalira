import { vi } from "vitest";

export function createPrismaMock() {
  return {
    parkingLocation: createModelMock(),
    locationAdmin: createModelMock(),
    pricingTier: createModelMock(),
    vehicleTypeRule: createModelMock(),
    parkingTicket: createModelMock(),
    payment: createModelMock(),
    licensePlateHistory: createModelMock(),
    user: createModelMock(),
    $transaction: vi.fn((fn) => fn()),
  };
}

function createModelMock() {
  return {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
