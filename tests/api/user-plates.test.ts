import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listPlates } from "~/app/api/user/plates/route";
import { POST as addPlate } from "~/app/api/user/plates/route";
import { setupApiTest, createNextRequest } from "../helpers/api";

vi.mock("~/server/better-auth/server", () => ({
  getSession: vi.fn(),
}));

describe("User Plates API", () => {
  let db: ReturnType<typeof setupApiTest>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = setupApiTest();
  });

  describe("GET /api/user/plates", () => {
    it("returns saved plates for authenticated user", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "user-1" },
        session: { id: "s-1" },
      });

      db.licensePlateHistory.findMany.mockResolvedValue([
        {
          id: "plate-1",
          userId: "user-1",
          licensePlate: "B1234ABC",
          licensePlateRaw: "B 1234 ABC",
          vehicleType: "CAR",
          label: "Mobil utama",
          useCount: 5,
          lastUsedAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const { request } = createNextRequest("/api/user/plates");
      const response = await listPlates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plates).toHaveLength(1);
      expect(data.plates[0].licensePlateRaw).toBe("B 1234 ABC");
    });

    it("returns 401 for unauthenticated users", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { request } = createNextRequest("/api/user/plates");
      const response = await listPlates(request);

      expect(response.status).toBe(401);
    });

    it("returns plates sorted by lastUsedAt desc", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "user-1" },
        session: { id: "s-1" },
      });

      db.licensePlateHistory.findMany.mockResolvedValue([]);

      const { request } = createNextRequest("/api/user/plates");
      await listPlates(request);

      expect(db.licensePlateHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          orderBy: { lastUsedAt: "desc" },
        }),
      );
    });
  });

  describe("POST /api/user/plates", () => {
    it("creates a new saved plate", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "user-1" },
        session: { id: "s-1" },
      });

      db.licensePlateHistory.findUnique.mockResolvedValue(null);
      db.licensePlateHistory.create.mockResolvedValue({
        id: "plate-new",
        userId: "user-1",
        licensePlate: "D5678XYZ",
        licensePlateRaw: "D 5678 XYZ",
        vehicleType: "CAR",
        label: "Mobil second",
        useCount: 1,
        lastUsedAt: new Date(),
        createdAt: new Date(),
      });

      const { request } = createNextRequest("/api/user/plates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licensePlate: "D 5678 XYZ",
          vehicleType: "CAR",
          label: "Mobil second",
        }),
      });

      const response = await addPlate(request);
      expect(response.status).toBe(201);
    });

    it("upserts if plate already exists for user", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "user-1" },
        session: { id: "s-1" },
      });

      db.licensePlateHistory.findUnique.mockResolvedValue({
        id: "plate-1",
        userId: "user-1",
        licensePlate: "B1234ABC",
        licensePlateRaw: "B 1234 ABC",
        vehicleType: "CAR",
        label: "Mobil utama",
        useCount: 5,
        lastUsedAt: new Date("2026-01-01"),
        createdAt: new Date(),
      });
      db.licensePlateHistory.update.mockResolvedValue({
        id: "plate-1",
        useCount: 6,
        lastUsedAt: new Date(),
      });

      const { request } = createNextRequest("/api/user/plates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licensePlate: "B 1234 ABC",
          vehicleType: "CAR",
        }),
      });

      const response = await addPlate(request);
      expect(response.status).toBe(200);
      expect(db.licensePlateHistory.update).toHaveBeenCalled();
    });

    it("returns 400 for invalid license plate", async () => {
      const { getSession } = await import("~/server/better-auth/server");
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "user-1" },
        session: { id: "s-1" },
      });

      const { request } = createNextRequest("/api/user/plates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licensePlate: "",
          vehicleType: "CAR",
        }),
      });

      const response = await addPlate(request);
      expect(response.status).toBe(400);
    });
  });
});
