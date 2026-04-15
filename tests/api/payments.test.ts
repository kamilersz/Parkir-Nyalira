import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "~/app/api/payments/webhook/route";
import { GET as getStatus } from "~/app/api/payments/[id]/status/route";
import { setupApiTest, createNextRequest } from "../helpers/api";
import {
  seedTicket,
  seedPayment,
  seedLocation,
  seedPaidTicket,
} from "../helpers/seed-data";

describe("POST /api/payments/webhook", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  const validWebhook = {
    ticketId: "ticket-1",
    paymentId: "pay-1",
    status: "SUCCESS",
    amount: 15000,
    paidAt: "2026-04-15T10:05:00Z",
    signature: "test-signature",
  };

  it("marks payment as successful and generates approval codes", async () => {
    db.payment.findUnique.mockResolvedValue(seedPayment);
    db.parkingTicket.findUnique.mockResolvedValue(seedTicket);
    db.parkingLocation.findUnique.mockResolvedValue(seedLocation);

    db.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        payment: {
          update: vi
            .fn()
            .mockResolvedValue({ ...seedPayment, status: "SUCCESS" }),
        },
        parkingTicket: {
          update: vi.fn().mockResolvedValue({
            ...seedTicket,
            status: "PAID",
            approvalCode: "4827",
            timeoutCode: "6301",
          }),
        },
        parkingLocation: {
          update: vi
            .fn()
            .mockResolvedValue({ ...seedLocation, balance: 515000 }),
        },
      };
      return fn(tx);
    });

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWebhook),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.ticket.status).toBe("PAID");
    expect(data.ticket.approvalCode).toBeDefined();
    expect(data.ticket.timeoutCode).toBeDefined();
  });

  it("returns 404 for unknown payment", async () => {
    db.payment.findUnique.mockResolvedValue(null);

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validWebhook,
        paymentId: "nonexistent",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it("returns 400 if amount does not match", async () => {
    db.payment.findUnique.mockResolvedValue(seedPayment);
    db.parkingTicket.findUnique.mockResolvedValue(seedTicket);

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validWebhook,
        amount: 99999,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 if payment already processed", async () => {
    db.payment.findUnique.mockResolvedValue({
      ...seedPayment,
      status: "SUCCESS",
    });

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWebhook),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("updates location balance on successful payment", async () => {
    db.payment.findUnique.mockResolvedValue(seedPayment);
    db.parkingTicket.findUnique.mockResolvedValue(seedTicket);
    db.parkingLocation.findUnique.mockResolvedValue(seedLocation);

    const txMocks = {
      payment: {
        update: vi
          .fn()
          .mockResolvedValue({ ...seedPayment, status: "SUCCESS" }),
      },
      parkingTicket: {
        update: vi.fn().mockResolvedValue({
          ...seedTicket,
          status: "PAID",
          approvalCode: "4827",
          timeoutCode: "6301",
        }),
      },
      parkingLocation: {
        update: vi.fn().mockResolvedValue({ ...seedLocation, balance: 515000 }),
      },
    };

    db.$transaction.mockImplementation(async (fn: Function) => fn(txMocks));

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWebhook),
    });

    await POST(request);

    expect(txMocks.parkingLocation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          balance: { increment: seedPayment.amount },
        }),
      }),
    );
  });

  it("stores webhook payload for audit", async () => {
    db.payment.findUnique.mockResolvedValue(seedPayment);
    db.parkingTicket.findUnique.mockResolvedValue(seedTicket);
    db.parkingLocation.findUnique.mockResolvedValue(seedLocation);

    const txMocks = {
      payment: {
        update: vi
          .fn()
          .mockResolvedValue({ ...seedPayment, status: "SUCCESS" }),
      },
      parkingTicket: {
        update: vi.fn().mockResolvedValue({
          ...seedTicket,
          status: "PAID",
        }),
      },
      parkingLocation: {
        update: vi.fn().mockResolvedValue(seedLocation),
      },
    };

    db.$transaction.mockImplementation(async (fn: Function) => fn(txMocks));

    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWebhook),
    });

    await POST(request);

    expect(txMocks.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          webhookPayload: JSON.stringify(validWebhook),
          status: "SUCCESS",
        }),
      }),
    );
  });

  it("returns 400 for invalid request body", async () => {
    const { request } = createNextRequest("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/payments/[id]/status", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  it("returns pending payment status", async () => {
    db.payment.findUnique.mockResolvedValue(seedPayment);

    const { request, params } = createNextRequest(
      "/api/payments/pay-1/status",
      { params: { id: "pay-1" } },
    );

    const response = await getStatus(request, {
      params: Promise.resolve(params),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("PENDING");
    expect(data.paidAt).toBeNull();
  });

  it("returns success payment status", async () => {
    db.payment.findUnique.mockResolvedValue({
      ...seedPayment,
      status: "SUCCESS",
      paidAt: new Date("2026-04-15T10:05:00Z"),
    });

    const { request, params } = createNextRequest(
      "/api/payments/pay-1/status",
      { params: { id: "pay-1" } },
    );

    const response = await getStatus(request, {
      params: Promise.resolve(params),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("SUCCESS");
    expect(data.paidAt).not.toBeNull();
  });

  it("returns 404 for unknown payment", async () => {
    db.payment.findUnique.mockResolvedValue(null);

    const { request, params } = createNextRequest(
      "/api/payments/nonexistent/status",
      { params: { id: "nonexistent" } },
    );

    const response = await getStatus(request, {
      params: Promise.resolve(params),
    });
    expect(response.status).toBe(404);
  });
});
