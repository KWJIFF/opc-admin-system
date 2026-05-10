import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "normal-user",
    email: "user@example.com",
    name: "Normal User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("scheduler", () => {
  describe("scheduler.status", () => {
    it("returns scheduler status with correct shape", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const status = await caller.scheduler.status();

      expect(status).toBeDefined();
      expect(typeof status.running).toBe("boolean");
      expect(typeof status.totalJobs).toBe("number");
      expect(Array.isArray(status.jobs)).toBe(true);
      expect(status.stats).toBeDefined();
      expect(typeof status.stats.successes).toBe("number");
      expect(typeof status.stats.failures).toBe("number");
      expect(typeof status.stats.totalRuns).toBe("number");
    });

    it("jobs array contains objects with expected fields when scheduler is running", async () => {
      // In test environment, scheduler may not be started, so jobs could be empty
      // This test validates the shape of the returned data
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const status = await caller.scheduler.status();

      // Verify jobs is an array (may be empty in test env)
      expect(Array.isArray(status.jobs)).toBe(true);
      // If there are jobs, verify their shape
      if (status.jobs.length > 0) {
        const job = status.jobs[0] as any;
        expect(job).toHaveProperty("name");
        expect(job).toHaveProperty("expression");
      }
    });
  });

  describe("scheduler.logs", () => {
    it("returns an array of logs", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const logs = await caller.scheduler.logs({ limit: 10 });

      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe("scheduler.triggerContent (admin only)", () => {
    it("rejects non-admin users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.scheduler.triggerContent({ category: "news" })
      ).rejects.toThrow();
    });
  });

  describe("scheduler.triggerHealthCheck (admin only)", () => {
    it("rejects non-admin users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.scheduler.triggerHealthCheck()
      ).rejects.toThrow();
    });
  });
});
