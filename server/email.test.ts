import { describe, it, expect } from "vitest";
import { renderConfirmationEmail, renderReminderEmail } from "./email";

describe("email helpers", () => {
  it("renderConfirmationEmail returns valid HTML with booker name", () => {
    const html = renderConfirmationEmail({
      bookerName: "Test User",
      bookingTypeName: "30 Minute Meeting",
      date: "2026-04-01",
      time: "10:00",
      durationMinutes: 30,
      isFree: true,
    });
    expect(html).toContain("Test User");
    expect(html).toContain("30 Minute Meeting");
    expect(html).toContain("Booking Confirmed");
    expect(html).toContain("30 minutes");
  });

  it("renderConfirmationEmail shows paid amount for non-free sessions", () => {
    const html = renderConfirmationEmail({
      bookerName: "Investor",
      bookingTypeName: "Deep Dive",
      date: "2026-04-02",
      time: "14:00",
      durationMinutes: 60,
      isFree: false,
      amountPaid: 18000,
    });
    expect(html).toContain("$180");
  });

  it("renderReminderEmail returns valid HTML with session details", () => {
    const html = renderReminderEmail({
      bookerName: "Reminder User",
      bookingTypeName: "Founder Investor Call",
      date: "2026-04-03",
      time: "09:00",
      durationMinutes: 30,
    });
    expect(html).toContain("Reminder User");
    expect(html).toContain("Founder Investor Call");
    expect(html).toContain("Reminder: Session Tomorrow");
  });

  it("sendEmail returns false when RESEND_API_KEY is not set", async () => {
    // Temporarily remove the key to test fallback behavior
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    const { sendEmail } = await import("./email");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    expect(result).toBe(false);
    // Restore
    if (originalKey) process.env.RESEND_API_KEY = originalKey;
  });
});
