import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { setMockDb } from "./helpers/api";

vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_GITHUB_CLIENT_ID: "test-id",
    BETTER_AUTH_GITHUB_CLIENT_SECRET: "test-secret",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  },
}));

function createMock() {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const op of [
    "findMany",
    "findUnique",
    "findFirst",
    "create",
    "update",
    "delete",
    "deleteMany",
    "count",
    "aggregate",
    "groupBy",
  ]) {
    mock[op] = vi.fn();
  }
  return mock;
}

const modelNames = [
  "parkingLocation",
  "locationAdmin",
  "pricingTier",
  "vehicleTypeRule",
  "parkingTicket",
  "payment",
  "licensePlateHistory",
  "user",
];

const db: Record<string, any> = {};
for (const name of modelNames) {
  db[name] = createMock();
}
db.$transaction = vi.fn((fn: any) => fn(db));

setMockDb(db);

vi.mock("~/server/db", () => ({
  db,
}));
