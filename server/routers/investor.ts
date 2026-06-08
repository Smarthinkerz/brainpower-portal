import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { investorContacts, investorInterestEvents } from "../../drizzle/schema";
import { desc, count, eq, gte } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const investorRouter = router({
  /**
   * Submit a contact form inquiry from the Investors portal
   */
  submitContact: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        company: z.string().max(255).optional(),
        investmentRange: z.string().max(100).optional(),
        message: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");

      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        (ctx.req.socket?.remoteAddress ?? null);
      const userAgent = (ctx.req.headers["user-agent"] as string) || null;

      await dbInstance.insert(investorContacts).values({
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        investmentRange: input.investmentRange ?? null,
        message: input.message,
        status: "new",
        ipAddress,
        userAgent,
      });

      // Log as an interest event
      await dbInstance.insert(investorInterestEvents).values({
        eventType: "contact_form_submit",
        metadata: { name: input.name, email: input.email, investmentRange: input.investmentRange },
        ipAddress,
        userAgent,
      });

      // Notify owner (non-blocking)
      try {
        await notifyOwner({
          title: "New Investor Contact Form Submission",
          content: `${input.name} (${input.email})${input.company ? ` from ${input.company}` : ""} submitted a contact form.\n\nInvestment Range: ${input.investmentRange ?? "Not specified"}\n\nMessage:\n${input.message}`,
        });
      } catch (_) {
        // Notification failure should not block the form submission
      }

      return { success: true };
    }),

  /**
   * Track a CTA interaction event (fire-and-forget from the frontend)
   */
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.enum([
          "schedule_call_click",
          "download_brief_click",
          "contact_form_submit",
          "faq_open",
          "invest_now_click",
          "page_view",
        ]),
        metadata: z.record(z.string(), z.unknown()).optional(),
        sessionId: z.string().max(128).optional(),
        referrer: z.string().max(2048).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return { success: false };

      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        (ctx.req.socket?.remoteAddress ?? null);
      const userAgent = (ctx.req.headers["user-agent"] as string) || null;

      await dbInstance.insert(investorInterestEvents).values({
        eventType: input.eventType,
        metadata: input.metadata ?? null,
        sessionId: input.sessionId ?? null,
        ipAddress,
        userAgent,
        referrer: input.referrer ?? null,
      });

      return { success: true };
    }),

  /**
   * Admin: get all contact form submissions
   */
  getContacts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return { contacts: [], total: 0 };

      const rows = await dbInstance
        .select()
        .from(investorContacts)
        .orderBy(desc(investorContacts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ total }] = await dbInstance
        .select({ total: count() })
        .from(investorContacts);

      return { contacts: rows, total };
    }),

  /**
   * Admin: update contact status
   */
  updateContactStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "in_progress", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");

      await dbInstance
        .update(investorContacts)
        .set({ status: input.status })
        .where(eq(investorContacts.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: get interest event summary stats
   */
  getInterestStats: protectedProcedure.query(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return {
      allEvents: [],
      recentEvents: [],
      recentContacts: [],
      totalContacts: 0,
      newContacts: 0,
    };

    const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const allEvents = await dbInstance
      .select({ eventType: investorInterestEvents.eventType, count: count() })
      .from(investorInterestEvents)
      .groupBy(investorInterestEvents.eventType);

    const recentEvents = await dbInstance
      .select({ eventType: investorInterestEvents.eventType, count: count() })
      .from(investorInterestEvents)
      .where(gte(investorInterestEvents.createdAt, since30Days))
      .groupBy(investorInterestEvents.eventType);

    const recentContacts = await dbInstance
      .select()
      .from(investorContacts)
      .where(gte(investorContacts.createdAt, since30Days))
      .orderBy(desc(investorContacts.createdAt))
      .limit(10);

    const [{ totalContacts }] = await dbInstance
      .select({ totalContacts: count() })
      .from(investorContacts);

    const [{ newContacts }] = await dbInstance
      .select({ newContacts: count() })
      .from(investorContacts)
      .where(eq(investorContacts.status, "new"));

    return {
      allEvents,
      recentEvents,
      recentContacts,
      totalContacts,
      newContacts,
    };
  }),
});
