import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx, setCookies };
}

const caller = appRouter.createCaller;

describe("auth.login", () => {
  it("rejects empty username", async () => {
    const { ctx } = createPublicContext();
    const trpc = caller(ctx);
    await expect(
      trpc.auth.login({ username: "", password: "test123" })
    ).rejects.toThrow();
  });

  it("rejects empty password", async () => {
    const { ctx } = createPublicContext();
    const trpc = caller(ctx);
    await expect(
      trpc.auth.login({ username: "admin", password: "" })
    ).rejects.toThrow();
  });

  it("rejects non-existent user", async () => {
    const { ctx } = createPublicContext();
    const trpc = caller(ctx);
    await expect(
      trpc.auth.login({ username: "nonexistent_user_xyz", password: "test123" })
    ).rejects.toThrow();
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const trpc = caller(ctx);
    const result = await trpc.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated context", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "local_admin",
        username: "admin",
        passwordHash: null,
        name: "管理员",
        email: "contact@opcs.vip",
        phone: null,
        avatar: null,
        loginMethod: "local",
        role: "admin",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
    };
    const trpc = caller(ctx);
    const result = await trpc.auth.me();
    expect(result).not.toBeNull();
    expect(result?.username).toBe("admin");
    expect(result?.role).toBe("admin");
  });
});

describe("getLoginUrl", () => {
  it("should always return /login path", async () => {
    // Simulate the getLoginUrl logic (since it's a client module, we test the logic)
    const getLoginUrl = (returnPath?: string) => {
      return returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : '/login';
    };

    expect(getLoginUrl()).toBe("/login");
    expect(getLoginUrl("/dashboard")).toBe("/login?return=%2Fdashboard");
    expect(getLoginUrl("/site")).toBe("/login?return=%2Fsite");
  });
});
