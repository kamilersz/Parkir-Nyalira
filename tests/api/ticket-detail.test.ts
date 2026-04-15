import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "~/app/api/tickets/[id]/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import { seedTicket, seedPaidTicket } from "../helpers/seed-data";

describe("GET /api/tickets/[id]", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  it("returns pending ticket without approval codes", async () => {
    db.parkingTicket.findUnique.mockResolvedValue({
      ...seedTicket,
      location: { name: "Parkir Mall XYZ", slug: "mall-xyz" },
    });

    const { request, params } = createNextRequest("/api/tickets/ticket-1", {
      params: { id: "ticket-1" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticket.id).toBe("ticket-1");
    expect(data.ticket.status).toBe("PENDING");
    expect(data.ticket.approvalCode).toBeNull();
  });

  it("returns paid ticket with approval codes", async () => {
    db.parkingTicket.findUnique.mockResolvedValue({
      ...seedPaidTicket,
      location: { name: "Parkir Mall XYZ", slug: "mall-xyz" },
    });

    const { request, params } = createNextRequest("/api/tickets/ticket-2", {
      params: { id: "ticket-2" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticket.status).toBe("PAID");
    expect(data.ticket.approvalCode).toBe("4827");
    expect(data.ticket.timeoutCode).toBe("6301");
    expect(data.ticket.validFrom).toBeDefined();
    expect(data.ticket.validUntil).toBeDefined();
  });

  it("returns 404 for non-existent ticket", async () => {
    db.parkingTicket.findUnique.mockResolvedValue(null);

    const { request, params } = createNextRequest("/api/tickets/nonexistent", {
      params: { id: "nonexistent" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    expect(response.status).toBe(404);
  });

  it("includes location name in response", async () => {
    db.parkingTicket.findUnique.mockResolvedValue({
      ...seedPaidTicket,
      location: { name: "Parkir Mall XYZ", slug: "mall-xyz" },
    });

    const { request, params } = createNextRequest("/api/tickets/ticket-2", {
      params: { id: "ticket-2" },
    });

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(data.ticket.locationName).toBe("Parkir Mall XYZ");
  });
});
