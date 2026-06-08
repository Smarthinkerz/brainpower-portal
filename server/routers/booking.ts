import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, desc, asc, ne } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import * as db from "../db";
import { sendEmail, renderConfirmationEmail } from "../email";

// ─── Seed default data helper ────────────────────────────────────────────────
async function seedDefaultDataIfNeeded(dbInstance: any) {
  const { bookingTypes, availabilitySchedules, availabilitySlots, emailTemplates } =
    await import("../../drizzle/schema");

  const existing = await dbInstance.select().from(bookingTypes).limit(1);
  if (existing.length > 0) return;

  await dbInstance.insert(bookingTypes).values([
    { name: "15 Minute Meeting", description: "Book a meeting with me for 15 minutes!", durationMinutes: 15, price: 0, currency: "USD", isFree: true, isActive: true, sortOrder: 1 },
    { name: "30 Minute Meeting", description: "Book a meeting with me for 30 minutes!", durationMinutes: 30, price: 0, currency: "USD", isFree: true, isActive: true, sortOrder: 2 },
    { name: "60 Minute Meeting", description: "Book a meeting with me for 60 minutes!", durationMinutes: 60, price: 6000, currency: "USD", isFree: false, isActive: true, sortOrder: 3 },
    { name: "Founder Investor Call – 30 minutes", description: "A concise introductory call to align on goals, discuss potential collaboration, and outline next steps.", durationMinutes: 30, price: 6000, currency: "USD", isFree: false, isActive: true, sortOrder: 4 },
    { name: "Deep Dive – 60 minutes", description: "A comprehensive 60-minute session to dive into your business needs, assess AI opportunities, and map an actionable plan.", durationMinutes: 60, price: 18000, currency: "USD", isFree: false, isActive: true, sortOrder: 5 },
  ]);

  const [schedule] = await dbInstance.insert(availabilitySchedules).values({
    name: "Default Schedule",
    timezone: "Asia/Muscat",
    isDefault: true,
  }).returning();
  const scheduleId = schedule.id;

  await dbInstance.insert(availabilitySlots).values([
    { scheduleId, dayOfWeek: 0, startTime: "08:00", endTime: "17:00", isAvailable: false },
    { scheduleId, dayOfWeek: 1, startTime: "08:00", endTime: "17:00", isAvailable: true },
    { scheduleId, dayOfWeek: 2, startTime: "08:00", endTime: "17:00", isAvailable: true },
    { scheduleId, dayOfWeek: 3, startTime: "08:00", endTime: "17:00", isAvailable: true },
    { scheduleId, dayOfWeek: 4, startTime: "08:00", endTime: "17:00", isAvailable: true },
    { scheduleId, dayOfWeek: 5, startTime: "08:00", endTime: "17:00", isAvailable: true },
    { scheduleId, dayOfWeek: 6, startTime: "08:00", endTime: "17:00", isAvailable: false },
  ]);

  await dbInstance.insert(emailTemplates).values([
    {
      triggerEvent: "booking_confirmed",
      subject: "Your booking with BrainPower AI is confirmed – {{bookingType}}",
      body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b1e;color:#e0e0ff;padding:32px;border-radius:12px;">
<h2 style="color:#00d4ff;">Booking Confirmed ✓</h2>
<p>Hi {{bookerName}},</p>
<p>Your <strong>{{bookingType}}</strong> with BrainPower AI is confirmed.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr><td style="padding:8px;color:#8888aa;">Date &amp; Time</td><td style="padding:8px;color:#e0e0ff;"><strong>{{bookingDate}} at {{bookingTime}}</strong></td></tr>
<tr><td style="padding:8px;color:#8888aa;">Duration</td><td style="padding:8px;color:#e0e0ff;">{{duration}} minutes</td></tr>
</table>
<p style="color:#8888aa;font-size:13px;">Need to reschedule? Reply to this email.</p>
<p style="color:#00d4ff;font-weight:bold;">BrainPower AI Team</p>
</div>`,
      isActive: true,
    },
    {
      triggerEvent: "booking_followup",
      subject: "How was your session with BrainPower AI?",
      body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b1e;color:#e0e0ff;padding:32px;border-radius:12px;">
<h2 style="color:#00d4ff;">Thank You for Your Time</h2>
<p>Hi {{bookerName}},</p>
<p>Thank you for your <strong>{{bookingType}}</strong> session with BrainPower AI.</p>
<p>We'd love to hear your feedback.</p>
<p style="color:#00d4ff;font-weight:bold;margin-top:24px;">BrainPower AI Team</p>
</div>`,
      isActive: true,
    },
    {
      triggerEvent: "booking_reminder",
      subject: "Reminder: Your BrainPower AI session is tomorrow – {{bookingType}}",
      body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b1e;color:#e0e0ff;padding:32px;border-radius:12px;">
<h2 style="color:#00d4ff;">Session Reminder</h2>
<p>Hi {{bookerName}},</p>
<p>Just a reminder that your <strong>{{bookingType}}</strong> is scheduled for <strong>{{bookingDate}} at {{bookingTime}}</strong>.</p>
<p style="color:#8888aa;font-size:13px;">See you soon!</p>
<p style="color:#00d4ff;font-weight:bold;">BrainPower AI Team</p>
</div>`,
      isActive: true,
    },
  ]);
}

// ─── Helper: generate time slots ─────────────────────────────────────────────
function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMinutes;
  }
  return slots;
}

export const bookingRouter = router({
  // ─── Public: Get all active booking types ────────────────────────────────
  getBookingTypes: publicProcedure.query(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return [];
    const { bookingTypes } = await import("../../drizzle/schema");
    await seedDefaultDataIfNeeded(dbInstance);
    return await dbInstance.select().from(bookingTypes)
      .where(eq(bookingTypes.isActive, true))
      .orderBy(asc(bookingTypes.sortOrder));
  }),

  // ─── Public: Get available time slots for a booking type on a date ───────
  getAvailableSlots: publicProcedure
    .input(z.object({ bookingTypeId: z.number(), date: z.string() }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { bookingTypes, availabilitySchedules, availabilitySlots, bookings } =
        await import("../../drizzle/schema");

      const [bookingType] = await dbInstance.select().from(bookingTypes)
        .where(eq(bookingTypes.id, input.bookingTypeId)).limit(1);
      if (!bookingType) return [];

      const dateObj = new Date(input.date);
      const dayOfWeek = dateObj.getDay();

      const [schedule] = await dbInstance.select().from(availabilitySchedules)
        .where(eq(availabilitySchedules.isDefault, true)).limit(1);
      if (!schedule) return [];

      const [slot] = await dbInstance.select().from(availabilitySlots)
        .where(and(
          eq(availabilitySlots.scheduleId, schedule.id),
          eq(availabilitySlots.dayOfWeek, dayOfWeek)
        )).limit(1);
      if (!slot || !slot.isAvailable) return [];

      const allSlots = generateTimeSlots(slot.startTime, slot.endTime, bookingType.durationMinutes);

      // Filter out already-booked slots on this date
      const dateStart = new Date(input.date + "T00:00:00Z");
      const dateEnd = new Date(input.date + "T23:59:59Z");
      const existingBookings = await dbInstance.select().from(bookings).where(
        and(
          eq(bookings.bookingTypeId, input.bookingTypeId),
          gte(bookings.scheduledAt, dateStart),
          lte(bookings.scheduledAt, dateEnd),
          ne(bookings.status, "cancelled")
        )
      );

      const bookedTimes = new Set(existingBookings.map((b: any) => {
        const d = new Date(b.scheduledAt);
        return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
      }));

      return allSlots.filter(s => !bookedTimes.has(s));
    }),

  // ─── Public: Create a booking ─────────────────────────────────────────────
  createBooking: publicProcedure
    .input(z.object({
      bookingTypeId: z.number(),
      date: z.string(),
      time: z.string(),
      bookerName: z.string().min(1),
      bookerEmail: z.string().email(),
      bookerPhone: z.string().optional(),
      bookerCompany: z.string().optional(),
      notes: z.string().optional(),
      couponCode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { bookingTypes, bookings, bookingContacts, coupons } =
        await import("../../drizzle/schema");

      const [bookingType] = await dbInstance.select().from(bookingTypes)
        .where(eq(bookingTypes.id, input.bookingTypeId)).limit(1);
      if (!bookingType) throw new TRPCError({ code: "NOT_FOUND", message: "Booking type not found" });

      const [h, m] = input.time.split(":").map(Number);
      const scheduledAt = new Date(input.date);
      scheduledAt.setUTCHours(h, m, 0, 0);

      // Handle coupon
      let discountAmount = 0;
      let couponCodeUsed: string | null = null;
      if (input.couponCode) {
        const [coupon] = await dbInstance.select().from(coupons)
          .where(and(eq(coupons.code, input.couponCode.toUpperCase()), eq(coupons.isActive, true)))
          .limit(1);
        if (coupon) {
          const now = new Date();
          const notExpired = !coupon.expiresAt || coupon.expiresAt > now;
          const hasUses = !coupon.maxUses || coupon.usesCount < coupon.maxUses;
          if (notExpired && hasUses) {
            if (coupon.discountType === "percentage") {
              discountAmount = Math.round(bookingType.price * coupon.discountValue / 100);
            } else {
              discountAmount = Math.min(coupon.discountValue, bookingType.price);
            }
            couponCodeUsed = coupon.code;
            await dbInstance.update(coupons)
              .set({ usesCount: coupon.usesCount + 1 })
              .where(eq(coupons.id, coupon.id));
          }
        }
      }

      const finalAmount = Math.max(0, bookingType.price - discountAmount);
      const paymentStatus = finalAmount === 0 ? "not_required" : "pending";

      // Upsert contact
      const [existingContact] = await dbInstance.select().from(bookingContacts)
        .where(eq(bookingContacts.email, input.bookerEmail)).limit(1);
      if (existingContact) {
        await dbInstance.update(bookingContacts).set({
          totalBookings: existingContact.totalBookings + 1,
          lastBookedAt: new Date(),
        }).where(eq(bookingContacts.id, existingContact.id));
      } else {
        await dbInstance.insert(bookingContacts).values({
          name: input.bookerName,
          email: input.bookerEmail,
          phone: input.bookerPhone,
          company: input.bookerCompany,
          totalBookings: 1,
          lastBookedAt: new Date(),
        });
      }

      const [newBooking] = await dbInstance.insert(bookings).values({
        bookingTypeId: input.bookingTypeId,
        bookerName: input.bookerName,
        bookerEmail: input.bookerEmail,
        bookerPhone: input.bookerPhone,
        bookerCompany: input.bookerCompany,
        scheduledAt,
        durationMinutes: bookingType.durationMinutes,
        status: paymentStatus === "not_required" ? "confirmed" : "pending",
        paymentStatus,
        paymentAmount: finalAmount,
        couponCode: couponCodeUsed,
        discountAmount,
        notes: input.notes,
      }).returning();

      await notifyOwner({
        title: `New Booking: ${bookingType.name}`,
        content: `${input.bookerName} (${input.bookerEmail}) booked a ${bookingType.name} for ${input.date} at ${input.time}. Amount: $${(finalAmount / 100).toFixed(2)}`,
      });

      // Send confirmation email to booker (non-blocking)
      const confirmHtml = renderConfirmationEmail({
        bookerName: input.bookerName,
        bookingTypeName: bookingType.name,
        date: input.date,
        time: input.time,
        durationMinutes: bookingType.durationMinutes,
        isFree: bookingType.isFree,
        amountPaid: finalAmount,
      });
      sendEmail({
        to: input.bookerEmail,
        subject: `Booking Confirmed: ${bookingType.name} on ${input.date}`,
        html: confirmHtml,
      }).catch(err => console.error('[email] Confirmation email failed:', err));

      return { bookingId: newBooking.id, paymentRequired: paymentStatus === "pending", amount: finalAmount };
    }),

  // ─── Public: Submit a review ──────────────────────────────────────────────
  submitReview: publicProcedure
    .input(z.object({
      bookingId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { bookings, bookingReviews } = await import("../../drizzle/schema");

      const [booking] = await dbInstance.select().from(bookings)
        .where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });

      await dbInstance.insert(bookingReviews).values({
        bookingId: input.bookingId,
        bookingTypeId: booking.bookingTypeId,
        bookerName: booking.bookerName,
        bookerEmail: booking.bookerEmail,
        rating: input.rating,
        comment: input.comment,
        isPublished: false,
      });

      return { success: true };
    }),

  // ─── Admin procedures ─────────────────────────────────────────────────────
  admin: router({
    getBookings: protectedProcedure
      .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { bookings, bookingTypes } = await import("../../drizzle/schema");
        const rows = await dbInstance.select({
          id: bookings.id,
          bookerName: bookings.bookerName,
          bookerEmail: bookings.bookerEmail,
          bookerPhone: bookings.bookerPhone,
          bookerCompany: bookings.bookerCompany,
          scheduledAt: bookings.scheduledAt,
          durationMinutes: bookings.durationMinutes,
          status: bookings.status,
          paymentStatus: bookings.paymentStatus,
          paymentAmount: bookings.paymentAmount,
          notes: bookings.notes,
          meetingLink: bookings.meetingLink,
          createdAt: bookings.createdAt,
          bookingTypeName: bookingTypes.name,
        }).from(bookings)
          .leftJoin(bookingTypes, eq(bookings.bookingTypeId, bookingTypes.id))
          .orderBy(asc(bookings.scheduledAt))
          .limit(input?.limit ?? 50);
        if (input?.status) {
          return rows.filter((r: any) => r.status === input.status);
        }
        return rows;
      }),

    updateBookingStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookings } = await import("../../drizzle/schema");
        await dbInstance.update(bookings).set({ status: input.status }).where(eq(bookings.id, input.bookingId));
        return { success: true };
      }),

    // ─── Admin: Set or clear meeting link on a booking ──────────────────────
    updateMeetingLink: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        meetingLink: z.string().url().nullable(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookings } = await import("../../drizzle/schema");
        await dbInstance.update(bookings)
          .set({ meetingLink: input.meetingLink })
          .where(eq(bookings.id, input.bookingId));
        return { success: true };
      }),

    getAvailability: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;
      const { availabilitySchedules, availabilitySlots } = await import("../../drizzle/schema");
      await seedDefaultDataIfNeeded(dbInstance);
      const [schedule] = await dbInstance.select().from(availabilitySchedules)
        .where(eq(availabilitySchedules.isDefault, true)).limit(1);
      if (!schedule) return null;
      const slots = await dbInstance.select().from(availabilitySlots)
        .where(eq(availabilitySlots.scheduleId, schedule.id))
        .orderBy(asc(availabilitySlots.dayOfWeek));
      return { schedule, slots };
    }),

    updateAvailabilitySlot: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        isAvailable: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { availabilitySlots } = await import("../../drizzle/schema");
        await dbInstance.update(availabilitySlots).set({
          isAvailable: input.isAvailable,
          startTime: input.startTime,
          endTime: input.endTime,
        }).where(eq(availabilitySlots.id, input.slotId));
        return { success: true };
      }),

    getContacts: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { bookingContacts } = await import("../../drizzle/schema");
      return await dbInstance.select().from(bookingContacts).orderBy(desc(bookingContacts.lastBookedAt));
    }),

    getBookingTypes: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { bookingTypes } = await import("../../drizzle/schema");
      await seedDefaultDataIfNeeded(dbInstance);
      return await dbInstance.select().from(bookingTypes).orderBy(asc(bookingTypes.sortOrder));
    }),

    createBookingType: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        durationMinutes: z.number().min(5),
        price: z.number().min(0),
        currency: z.string().default("USD"),
        isFree: z.boolean(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookingTypes } = await import("../../drizzle/schema");
        const [result] = await dbInstance.insert(bookingTypes).values({ ...input, isActive: true, sortOrder: 99 }).returning();
        return result;
      }),

    updateBookingType: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        durationMinutes: z.number().optional(),
        price: z.number().optional(),
        isFree: z.boolean().optional(),
        isActive: z.boolean().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookingTypes } = await import("../../drizzle/schema");
        const { id, ...updates } = input;
        await dbInstance.update(bookingTypes).set(updates).where(eq(bookingTypes.id, id));
        return { success: true };
      }),

    deleteBookingType: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookingTypes } = await import("../../drizzle/schema");
        await dbInstance.update(bookingTypes).set({ isActive: false }).where(eq(bookingTypes.id, input.id));
        return { success: true };
      }),

    getCoupons: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { coupons } = await import("../../drizzle/schema");
      return await dbInstance.select().from(coupons).orderBy(desc(coupons.createdAt));
    }),

    createCoupon: protectedProcedure
      .input(z.object({
        code: z.string().min(1),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(0),
        maxUses: z.number().optional(),
        expiresAt: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { coupons } = await import("../../drizzle/schema");
        const expiresAtDate = input.expiresAt ? new Date(input.expiresAt) : undefined;
        const [result] = await dbInstance.insert(coupons).values({
          code: input.code.toUpperCase(),
          discountType: input.discountType,
          discountValue: input.discountValue,
          maxUses: input.maxUses,
          expiresAt: expiresAtDate,
          isActive: true,
          usesCount: 0,
        }).returning();
        return result;
      }),

    deleteCoupon: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { coupons } = await import("../../drizzle/schema");
        await dbInstance.update(coupons).set({ isActive: false }).where(eq(coupons.id, input.id));
        return { success: true };
      }),

    getReviews: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { bookingReviews, bookingTypes } = await import("../../drizzle/schema");
      return await dbInstance.select({
        id: bookingReviews.id,
        bookerName: bookingReviews.bookerName,
        bookerEmail: bookingReviews.bookerEmail,
        rating: bookingReviews.rating,
        comment: bookingReviews.comment,
        isPublished: bookingReviews.isPublished,
        createdAt: bookingReviews.createdAt,
        bookingTypeName: bookingTypes.name,
      }).from(bookingReviews)
        .leftJoin(bookingTypes, eq(bookingReviews.bookingTypeId, bookingTypes.id))
        .orderBy(desc(bookingReviews.createdAt));
    }),

    publishReview: protectedProcedure
      .input(z.object({ id: z.number(), isPublished: z.boolean() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookingReviews } = await import("../../drizzle/schema");
        await dbInstance.update(bookingReviews).set({ isPublished: input.isPublished }).where(eq(bookingReviews.id, input.id));
        return { success: true };
      }),

    getEmailTemplates: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { emailTemplates } = await import("../../drizzle/schema");
      await seedDefaultDataIfNeeded(dbInstance);
      return await dbInstance.select().from(emailTemplates);
    }),

    updateEmailTemplate: protectedProcedure
      .input(z.object({
        id: z.number(),
        subject: z.string().optional(),
        body: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { emailTemplates } = await import("../../drizzle/schema");
        const { id, ...updates } = input;
        await dbInstance.update(emailTemplates).set(updates).where(eq(emailTemplates.id, id));
        return { success: true };
      }),

    getDashboardStats: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;
      const { bookings, bookingContacts, bookingReviews } = await import("../../drizzle/schema");

      const allBookings = await dbInstance.select().from(bookings);
      const total = allBookings.length;
      const confirmed = allBookings.filter((b: any) => b.status === "confirmed").length;
      const completed = allBookings.filter((b: any) => b.status === "completed").length;
      const cancelled = allBookings.filter((b: any) => b.status === "cancelled").length;
      const pending = allBookings.filter((b: any) => b.status === "pending").length;
      const revenue = allBookings
        .filter((b: any) => b.paymentStatus === "paid")
        .reduce((sum: number, b: any) => sum + (b.paymentAmount ?? 0), 0);

      const contacts = await dbInstance.select().from(bookingContacts);
      const reviews = await dbInstance.select().from(bookingReviews);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      return { total, confirmed, completed, cancelled, pending, revenue, totalContacts: contacts.length, totalReviews: reviews.length, avgRating: Math.round(avgRating * 10) / 10 };
    }),

    // ─── Admin: Send follow-up email to a completed booking ──────────────────
    sendFollowUpEmail: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookings, bookingTypes, emailTemplates } = await import("../../drizzle/schema");
        const [booking] = await dbInstance.select({
          id: bookings.id,
          bookerName: bookings.bookerName,
          bookerEmail: bookings.bookerEmail,
          scheduledAt: bookings.scheduledAt,
          durationMinutes: bookings.durationMinutes,
          status: bookings.status,
          bookingTypeName: bookingTypes.name,
        }).from(bookings)
          .leftJoin(bookingTypes, eq(bookings.bookingTypeId, bookingTypes.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        // Fetch the follow-up template
        const [template] = await dbInstance.select().from(emailTemplates)
          .where(eq(emailTemplates.triggerEvent, "booking_followup")).limit(1);
        if (!template || !template.isActive) {
          return { success: false, reason: "Follow-up template is disabled" };
        }
        const scheduledDate = new Date(booking.scheduledAt);
        const dateStr = scheduledDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        const subject = template.subject
          .replace(/{{bookingType}}/g, booking.bookingTypeName ?? "Session")
          .replace(/{{bookerName}}/g, booking.bookerName);
        const html = template.body
          .replace(/{{bookerName}}/g, booking.bookerName)
          .replace(/{{bookingType}}/g, booking.bookingTypeName ?? "Session")
          .replace(/{{bookingDate}}/g, dateStr)
          .replace(/{{bookingTime}}/g, scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
        const sent = await sendEmail({ to: booking.bookerEmail, subject, html });
        return { success: sent, email: booking.bookerEmail };
      }),

    // ─── Admin: Send bulk follow-up emails to all completed bookings ─────────
    sendBulkFollowUpEmails: protectedProcedure
      .mutation(async () => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { bookings, bookingTypes, emailTemplates } = await import("../../drizzle/schema");
        const [template] = await dbInstance.select().from(emailTemplates)
          .where(eq(emailTemplates.triggerEvent, "booking_followup")).limit(1);
        if (!template || !template.isActive) {
          return { sent: 0, reason: "Follow-up template is disabled" };
        }
        const completedBookings = await dbInstance.select({
          id: bookings.id,
          bookerName: bookings.bookerName,
          bookerEmail: bookings.bookerEmail,
          scheduledAt: bookings.scheduledAt,
          bookingTypeName: bookingTypes.name,
        }).from(bookings)
          .leftJoin(bookingTypes, eq(bookings.bookingTypeId, bookingTypes.id))
          .where(eq(bookings.status, "completed"));
        let sent = 0;
        for (const booking of completedBookings) {
          const scheduledDate = new Date(booking.scheduledAt);
          const dateStr = scheduledDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
          const subject = template.subject
            .replace(/{{bookingType}}/g, booking.bookingTypeName ?? "Session")
            .replace(/{{bookerName}}/g, booking.bookerName);
          const html = template.body
            .replace(/{{bookerName}}/g, booking.bookerName)
            .replace(/{{bookingType}}/g, booking.bookingTypeName ?? "Session")
            .replace(/{{bookingDate}}/g, dateStr)
            .replace(/{{bookingTime}}/g, scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
          const ok = await sendEmail({ to: booking.bookerEmail, subject, html });
          if (ok) sent++;
        }
        return { sent, total: completedBookings.length };
      }),
  }),
});
