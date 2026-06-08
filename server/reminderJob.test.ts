/**
 * Tests for the reminder job and meeting link feature.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Email helper tests ───────────────────────────────────────────────────────

describe("renderReminderEmail", () => {
  it("includes booker name and session name", async () => {
    const { renderReminderEmail } = await import("./email");
    const html = renderReminderEmail({
      bookerName: "Alice",
      bookingTypeName: "30 Minute Meeting",
      date: "Monday, March 27, 2026",
      time: "10:00 AM",
      durationMinutes: 30,
    });
    expect(html).toContain("Alice");
    expect(html).toContain("30 Minute Meeting");
    expect(html).toContain("Reminder: Session Tomorrow");
  });

  it("includes a Join Meeting button when meetingLink is provided", async () => {
    const { renderReminderEmail } = await import("./email");
    const html = renderReminderEmail({
      bookerName: "Bob",
      bookingTypeName: "60 Minute Meeting",
      date: "Tuesday, March 28, 2026",
      time: "2:00 PM",
      durationMinutes: 60,
      meetingLink: "https://meet.google.com/abc-defg-hij",
    });
    expect(html).toContain("Join Meeting");
    expect(html).toContain("https://meet.google.com/abc-defg-hij");
  });

  it("omits the Join Meeting button when no meetingLink", async () => {
    const { renderReminderEmail } = await import("./email");
    const html = renderReminderEmail({
      bookerName: "Carol",
      bookingTypeName: "15 Minute Meeting",
      date: "Wednesday, March 29, 2026",
      time: "9:00 AM",
      durationMinutes: 15,
    });
    expect(html).not.toContain("Join Meeting");
  });

  it("formats duration in hours for 60+ minute sessions", async () => {
    const { renderReminderEmail } = await import("./email");
    const html = renderReminderEmail({
      bookerName: "Dave",
      bookingTypeName: "Deep Dive",
      date: "Thursday, March 30, 2026",
      time: "3:00 PM",
      durationMinutes: 60,
    });
    expect(html).toContain("1 hour");
  });
});

// ─── sendEmail no-op test ─────────────────────────────────────────────────────

describe("sendEmail", () => {
  it("returns false and does not throw when RESEND_API_KEY is absent", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    const { sendEmail } = await import("./email");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    expect(result).toBe(false);
    if (originalKey !== undefined) process.env.RESEND_API_KEY = originalKey;
  });
});

// ─── renderConfirmationEmail with meetingLink ─────────────────────────────────

describe("renderConfirmationEmail with meetingLink", () => {
  it("includes Join Meeting button when meetingLink is provided", async () => {
    const { renderConfirmationEmail } = await import("./email");
    const html = renderConfirmationEmail({
      bookerName: "Eve",
      bookingTypeName: "Founder Investor Call",
      date: "2026-03-27",
      time: "10:00",
      durationMinutes: 30,
      isFree: false,
      amountPaid: 6000,
      meetingLink: "https://zoom.us/j/123456789",
    });
    expect(html).toContain("Join Meeting");
    expect(html).toContain("https://zoom.us/j/123456789");
    expect(html).toContain("Booking Confirmed");
  });
});
