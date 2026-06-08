import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(role: string = 'super_admin'): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@brainpower.ai",
    name: "Admin User",
    loginMethod: "manus",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    twoFactorEnabled: false,
    twoFactorSecret: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createNonAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    twoFactorEnabled: false,
    twoFactorSecret: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Admin Dashboard - Access Control", () => {
  it("allows super_admin to access dashboard stats", async () => {
    const { ctx } = createAdminContext('super_admin');
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getDashboardStats();

    expect(result).toBeDefined();
    expect(result.stats).toBeDefined();
  });

  it("allows content_manager to access content management", async () => {
    const { ctx } = createAdminContext('content_manager');
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.content.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows investor_admin to access investor management", async () => {
    const { ctx } = createAdminContext('investor_admin');
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.investors.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("denies regular users from accessing admin routes", async () => {
    const { ctx } = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getDashboardStats()).rejects.toThrow();
  });

  it("only allows super_admin to access user management", async () => {
    const { ctx } = createAdminContext('admin');
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.users.list()).rejects.toThrow();
  });
});

describe("Admin Dashboard - Content Management", () => {
  it("can list content blocks", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.content.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can create a new content block", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.content.create({
      blockKey: `test_block_${Date.now()}`,
      blockType: "text",
      title: "Test Block",
      content: "Test content",
      status: "draft",
    });

    expect(result.success).toBe(true);
  });

  it("can filter content blocks by status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.content.list({ status: "published" });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Investor Management", () => {
  it("can list all investors", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.investors.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can filter investors by status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.investors.list({ status: "pending" });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Document Management", () => {
  it("can list all documents", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.documents.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Media Library", () => {
  it("can list all media", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.media.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can filter media by type", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.media.list({ mediaType: "image" });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Analytics", () => {
  it("can retrieve analytics summary", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.analytics.summary();

    expect(result).toBeDefined();
    expect(typeof result.totalEvents).toBe('number');
    expect(typeof result.totalInvestors).toBe('number');
  });

  it("can retrieve analytics events", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.analytics.events();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Notifications", () => {
  it("can list notifications", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can filter unread notifications", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.list({ unreadOnly: true });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin Dashboard - Audit Logs", () => {
  it("can retrieve audit logs", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.auditLogs.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("respects limit parameter", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.auditLogs.list({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});
