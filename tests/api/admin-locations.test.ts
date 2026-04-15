import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listLocations } from "~/app/api/admin/locations/route";
import { POST as createLocation } from "~/app/api/admin/locations/route";
import { GET as getLocation } from "~/app/api/admin/locations/[id]/route";
import { PATCH as updateLocation } from "~/app/api/admin/locations/[id]/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import { seedLocation, seedLocationAdmin } from "../helpers/seed-data";

vi.mock("~/server/better-auth/server", () => ({
  getSession: vi.fn(),
}));

describe("Admin Location APIs", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  describe("GET /api/admin/locations", () => {
    it("returns locations the admin has access to", async () => {
      db.locationAdmin.findMany.mockResolvedValue([
        { ...seedLocationAdmin, location: seedLocation },
      ]);

      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      const { request } = createNextRequest("/api/admin/locations");
      const response = await listLocations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.locations).toHaveLength(1);
      expect(data.locations[0].name).toBe("Parkir Mall XYZ");
    });

    it("returns 401 for unauthenticated users", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { request } = createNextRequest("/api/admin/locations");
      const response = await listLocations(request);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/admin/locations", () => {
    const validBody = {
      name: "Parkir Baru",
      slug: "parkir-baru",
      address: "Jl. Baru No. 1",
      pricingMode: "FLAT_HOURLY",
    };

    it("creates a new location and assigns caller as OWNER", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.parkingLocation.create.mockResolvedValue({
        id: "new-loc",
        ...validBody,
        latitude: null,
        longitude: null,
        description: null,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      db.locationAdmin.create.mockResolvedValue({
        id: "new-admin",
        userId: "admin-user-1",
        locationId: "new-loc",
        role: "OWNER",
        createdAt: new Date(),
      });

      const { request } = createNextRequest("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      });

      const response = await createLocation(request);
      expect(response.status).toBe(201);

      expect(db.parkingLocation.create).toHaveBeenCalled();
      expect(db.locationAdmin.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "admin-user-1",
            role: "OWNER",
          }),
        }),
      );
    });

    it("returns 400 for duplicate slug", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.parkingLocation.create.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const { request } = createNextRequest("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validBody,
          slug: "mall-xyz",
        }),
      });

      const response = await createLocation(request);
      expect(response.status).toBe(409);
    });

    it("returns 400 for missing required fields", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      const { request } = createNextRequest("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "No slug" }),
      });

      const response = await createLocation(request);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/admin/locations/[id]", () => {
    it("returns location details for authorized admin", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(seedLocationAdmin);
      db.parkingLocation.findUnique.mockResolvedValue(seedLocation);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1",
        { params: { id: "loc-1" } },
      );

      const response = await getLocation(request, {
        params: Promise.resolve(params),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.location.name).toBe("Parkir Mall XYZ");
    });

    it("returns 403 if user is not admin of this location", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "other-user" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue(null);

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1",
        { params: { id: "loc-1" } },
      );

      const response = await getLocation(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(403);
    });
  });

  describe("PATCH /api/admin/locations/[id]", () => {
    it("updates location for OWNER role", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "admin-user-1" },
        session: { id: "s-1" },
      });

      db.locationAdmin.findFirst.mockResolvedValue({
        ...seedLocationAdmin,
        role: "OWNER",
      });
      db.parkingLocation.update.mockResolvedValue({
        ...seedLocation,
        name: "Updated Name",
      });

      const { request, params } = createNextRequest(
        "/api/admin/locations/loc-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Name" }),
          params: { id: "loc-1" },
        },
      );

      const response = await updateLocation(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(200);
    });

    it("returns 403 for OPERATOR role trying to update settings", async () => {
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
        "/api/admin/locations/loc-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Hack" }),
          params: { id: "loc-1" },
        },
      );

      const response = await updateLocation(request, {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(403);
    });
  });
});
