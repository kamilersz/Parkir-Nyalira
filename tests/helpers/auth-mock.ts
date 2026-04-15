import { vi } from "vitest";

export function mockAuthSession(session: Record<string, unknown> | null) {
  vi.mock("~/server/better-auth/server", () => ({
    getSession: vi.fn().mockResolvedValue(session),
  }));
}

export function mockAuthApiKey(session: Record<string, unknown> | null) {
  vi.mock("~/server/better-auth", () => ({
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue(session),
      },
    },
  }));
}

export const mockAdminSession = {
  user: {
    id: "admin-user-1",
    name: "Admin Test",
    email: "admin@test.com",
  },
  session: {
    id: "session-1",
    userId: "admin-user-1",
  },
};

export const mockRegularSession = {
  user: {
    id: "user-1",
    name: "User Test",
    email: "user@test.com",
  },
  session: {
    id: "session-2",
    userId: "user-1",
  },
};

export const mockNoSession = null;
