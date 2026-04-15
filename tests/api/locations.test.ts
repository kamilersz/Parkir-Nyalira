import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "~/app/api/locations/[slug]/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import {
  seedLocation,
  seedPricingTiers,
  seedVehicleRules,
} from "../helpers/seed-data";

describe("GET /api/locations/[slug]", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  it("returns location with pricing and vehicle rules", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: seedVehicleRules.filter(
        (r) => r.locationId === seedLocation.id,
      ),
    });

    const { request, params } = createNextRequest("/api/locations/mall-xyz", {
      params: { slug: "mall-xyz" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.location.name).toBe("Parkir Mall XYZ");
    expect(data.location.slug).toBe("mall-xyz");
    expect(data.location.pricingMode).toBe("FLAT_HOURLY");
    expect(data.pricingTiers).toHaveLength(3);
    expect(data.vehicleTypeRules).toHaveLength(3);
  });

  it("returns 404 for non-existent location", async () => {
    db.parkingLocation.findUnique.mockResolvedValue(null);

    const { request, params } = createNextRequest(
      "/api/locations/nonexistent",
      { params: { slug: "nonexistent" } },
    );

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it("returns 404 for inactive location", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      isActive: false,
    });

    const { request, params } = createNextRequest("/api/locations/mall-xyz", {
      params: { slug: "mall-xyz" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    expect(response.status).toBe(404);
  });

  it("includes only active pricing tiers", async () => {
    const tiers = seedPricingTiers
      .filter((t) => t.locationId === seedLocation.id)
      .map((t, i) => ({ ...t, isActive: i === 0 }));

    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: tiers,
      vehicleTypeRules: [],
    });

    const { request, params } = createNextRequest("/api/locations/mall-xyz", {
      params: { slug: "mall-xyz" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(data.pricingTiers).toHaveLength(1);
  });
});
