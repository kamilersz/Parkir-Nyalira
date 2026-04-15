import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "~/app/api/tickets/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import {
  seedLocation,
  seedPricingTiers,
  seedVehicleRules,
  seedTicket,
  seedPayment,
} from "../helpers/seed-data";

describe("POST /api/tickets", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  const validBody = {
    locationSlug: "mall-xyz",
    licensePlate: "B 1234 ABC",
    vehicleType: "CAR",
    durationMinutes: 120,
  };

  it("creates a ticket with valid data", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: seedVehicleRules.filter(
        (r) => r.locationId === seedLocation.id,
      ),
    });
    db.parkingTicket.create.mockResolvedValue(seedTicket);
    db.payment.create.mockResolvedValue(seedPayment);

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.ticket).toBeDefined();
    expect(data.payment).toBeDefined();
  });

  it("calculates correct price for 2-hour car parking", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: [],
    });

    const carTier = seedPricingTiers.find(
      (t) => t.locationId === seedLocation.id && t.vehicleType === "CAR",
    )!;

    db.parkingTicket.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedTicket, ...data }),
    );
    db.payment.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedPayment, ...data }),
    );

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        durationMinutes: 120,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.ticket.totalPrice).toBe(15000);
  });

  it("returns 404 for non-existent location", async () => {
    db.parkingLocation.findUnique.mockResolvedValue(null);

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it("returns 400 for unsupported vehicle type", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: [],
      vehicleTypeRules: [],
    });

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        vehicleType: "TRUCK",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid license plate", async () => {
    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        licensePlate: "",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for zero duration", async () => {
    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        durationMinutes: 0,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for negative duration", async () => {
    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        durationMinutes: -30,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for missing required fields", async () => {
    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("normalizes license plate to uppercase without spaces", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: [],
    });
    db.parkingTicket.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedTicket, ...data }),
    );
    db.payment.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedPayment, ...data }),
    );

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        licensePlate: "b 1234 abc",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    expect(db.parkingTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          licensePlate: "B1234ABC",
          licensePlateRaw: "B 1234 ABC",
        }),
      }),
    );
  });

  it("creates payment with QRIS payload for the ticket amount", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: [],
    });
    db.parkingTicket.create.mockResolvedValue(seedTicket);
    db.payment.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedPayment, ...data }),
    );

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    await POST(request);

    expect(db.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 15000,
          status: "PENDING",
          ticketId: seedTicket.id,
        }),
      }),
    );
  });

  it("works with FIXED_DAILY pricing mode", async () => {
    db.parkingLocation.findUnique.mockResolvedValue({
      ...seedLocation,
      pricingMode: "FIXED_DAILY",
      pricingTiers: seedPricingTiers.filter(
        (t) => t.locationId === seedLocation.id,
      ),
      vehicleTypeRules: [],
    });
    db.parkingTicket.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedTicket, ...data }),
    );
    db.payment.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...seedPayment, ...data }),
    );

    const { request } = createNextRequest("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        durationMinutes: 1440,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.ticket.totalPrice).toBe(75000);
  });
});
