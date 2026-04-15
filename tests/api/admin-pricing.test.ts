import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listPricing } from "~/app/api/admin/locations/[id]/pricing/route";
import { POST as createPricing } from "~/app/api/admin/locations/[id]/pricing/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import { seedLocationAdmin, seedPricingTiers } from "../helpers/seed-data";

vi.mock("~/server/better-auth/server", () => ({
  getSession: vi.fn(),
}));

describe("Admin Pricing API", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  describe("GET /api/admin/locations/[id]/pricing", () => {
    it("returns pricing tiers for authorized admin", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(seedLocationAdmin);
      db.pricingTier.findMany.mockResolvedValue(
        seedPricingTiers.filter((t) => t.locationId === "loc-1"),
      );

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/pricing",
        { params: { id: "loc-1" } },
      );

      const response = await listPricing(request, {
        params: Promise.resolve(params),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tiers).toHaveLength(3);
    });
  });

  describe("POST /api/admin/locations/[id]/pricing", () => {
    const validTier = {
      vehicleType: "CAR",
      firstHourRate: 10000,
      additionalHourRate: 5000,
      dailyRate: 75000,
      maxDailyRate: 75000,
      gracePeriodMinutes: 15,
    };

    it("creates a pricing tier for OWNER", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        role: "OWNER",
      });
      db.pricingTier.create.mockResolvedValue({
        id: "new-tier",
        locationId: "loc-1",
        ...validTier,
        isActive: true,
      });

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/pricing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validTier),
          params: { id: "loc-1" },
        },
      );

      const response = await createPricing(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(201);
    });

    it("rejects OPERATOR from creating tiers", async () => {
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
        "/api/admin/locations/loc-1/pricing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validTier),
          params: { id: "loc-1" },
        },
      );

      const response = await createPricing(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(403);
    });

    it("returns 400 for duplicate vehicle type tier", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        role: "OWNER",
      });
      db.pricingTier.findFirst.mockResolvedValue(seedPricingTiers[1]);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/pricing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validTier),
          params: { id: "loc-1" },
        },
      );

      const response = await createPricing(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(409);
    });

    it("returns 400 for negative rates", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        role: "OWNER",
      });

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1/pricing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...validTier, firstHourRate: -1000 }),
          params: { id: "loc-1" },
        },
      );

      const response = await createPricing(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(400);
    });
  });
});
