import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listTransactions } from "~/app/api/admin/locations/[id]/transactions/route";
import { GET as getBalance } from "~/app/api/admin/locations/[id]/balance/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import { seedLocationAdmin, seedPaidTicket } from "../helpers/seed-data";

vi.mock("~/server/better-auth/server", () => ({
  getSession: vi.fn(),
}));

describe("Admin Transactions API", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  describe("GET /api/admin/locations/[id]/transactions", () => {
    it("returns paginated transactions", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(seedLocationAdmin);
      db.parkingTicket.findMany.mockResolvedValue([seedPaidTicket]);
      db.parkingTicket.count.mockResolvedValue(1);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/locations?page=1&limit=10",
        { params: { id: "loc-1" } },
      );

      const response = await listTransactions(request, {
        params: Promise.resolve(params),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(1);
    });

    it("filters by status", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(seedLocationAdmin);
      db.parkingTicket.findMany.mockResolvedValue([]);
      db.parkingTicket.count.mockResolvedValue(0);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/transactions?status=PAID",
        { params: { id: "loc-1" } },
      );

      const response = await listTransactions(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(200);

      expect(db.parkingTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PAID",
          }),
        }),
      );
    });

    it("filters by date range", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(seedLocationAdmin);
      db.parkingTicket.findMany.mockResolvedValue([]);
      db.parkingTicket.count.mockResolvedValue(0);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/transactions?from=2026-04-01&to=2026-04-15",
        { params: { id: "loc-1" } },
      );

      const response = await listTransactions(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(200);
    });

    it("returns 403 for non-admin users", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "other-user" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(null);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/transactions",
        { params: { id: "loc-1" } },
      );

      const response = await listTransactions(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(403);
    });
  });
});

describe("Admin Balance API", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  describe("GET /api/admin/locations/[id]/balance", () => {
    it("returns balance summary for OWNER", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        role: "OWNER",
      });
      db.parkingLocation.findUnique.mockResolvedValue({
        id: "loc-1",
        name: "Parkir Mall XYZ",
        balance: 500000,
      });
      db.parkingTicket.aggregate.mockResolvedValue({
        _sum: { totalPrice: 150000 },
        _count: 15,
      });

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/balance",
        { params: { id: "loc-1" } },
      );

      const response = await getBalance(request, {
        params: Promise.resolve(params),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balance).toBe(500000);
      expect(data.todayIncome).toBeDefined();
    });

    it("returns 403 for OPERATOR role", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "operator-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        userId: "operator-1",
        role: "OPERATOR",
      });

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/balance",
        { params: { id: "loc-1" } },
      );

      const response = await getBalance(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(403);
    });
  });
});
