/**
 * Scheduled reminder job — sends a 24h-before reminder email to confirmed bookings.
 * Runs every 15 minutes. Idempotent: uses reminderEmailSent flag to prevent duplicates.
 */

import { eq, and, gte, lte } from "drizzle-orm";
import * as db from "./db";
import { sendEmail, renderReminderEmail } from "./email";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function startReminderJob(): void {
  console.log("[reminderJob] Started — checking every 15 minutes for upcoming reminders");

  const run = async () => {
    try {
      await sendPendingReminders();
    } catch (err) {
      console.error("[reminderJob] Unexpected error:", err);
    }
  };

  // Run once immediately on startup, then on interval
  run();
  setInterval(run, INTERVAL_MS);
}

async function sendPendingReminders(): Promise<void> {
  const dbInstance = await db.getDb();
  if (!dbInstance) return;

  const { bookings, bookingTypes } = await import("../drizzle/schema");

  const now = new Date();
  // Window: bookings scheduled between 23h and 25h from now
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const due = await dbInstance
    .select({
      id:              bookings.id,
      bookerName:      bookings.bookerName,
      bookerEmail:     bookings.bookerEmail,
      scheduledAt:     bookings.scheduledAt,
      durationMinutes: bookings.durationMinutes,
      meetingLink:     bookings.meetingLink,
      bookingTypeName: bookingTypes.name,
    })
    .from(bookings)
    .leftJoin(bookingTypes, eq(bookings.bookingTypeId, bookingTypes.id))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        eq(bookings.reminderEmailSent, false),
        gte(bookings.scheduledAt, windowStart),
        lte(bookings.scheduledAt, windowEnd),
      )
    );

  if (due.length === 0) {
    console.log("[reminderJob] No reminders due in this window");
    return;
  }

  console.log(`[reminderJob] Sending ${due.length} reminder(s)`);

  for (const booking of due) {
    const d = new Date(booking.scheduledAt);
    const date = d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "Asia/Muscat",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit",
      timeZone: "Asia/Muscat",
    });

    const html = renderReminderEmail({
      bookerName:      booking.bookerName,
      bookingTypeName: booking.bookingTypeName ?? "Session",
      date,
      time,
      durationMinutes: booking.durationMinutes,
      meetingLink:     booking.meetingLink ?? undefined,
    });

    const sent = await sendEmail({
      to:      booking.bookerEmail,
      subject: `Reminder: Your session tomorrow — ${booking.bookingTypeName ?? "Session"}`,
      html,
    });

    if (sent) {
      await dbInstance
        .update(bookings)
        .set({ reminderEmailSent: true })
        .where(eq(bookings.id, booking.id));
      console.log(`[reminderJob] Reminder sent → ${booking.bookerEmail} (booking #${booking.id})`);
    } else {
      console.warn(`[reminderJob] Failed to send reminder → ${booking.bookerEmail} (booking #${booking.id})`);
    }
  }
}
