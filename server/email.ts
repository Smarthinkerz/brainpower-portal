/**
 * Email helper for booking system notifications.
 * Uses Resend API when RESEND_API_KEY is configured.
 * Falls back to console logging (no-op) when key is absent.
 */

import { ENV } from "./_core/env";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend API.
 * Returns true on success, false on failure (never throws).
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set — skipping email to ${payload.to}: ${payload.subject}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BrainPower AI <noreply@brainpower.ai>",
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[email] Resend error ${res.status}: ${text}`);
      return false;
    }
    console.log(`[email] Sent to ${payload.to}: ${payload.subject}`);
    return true;
  } catch (err) {
    console.error("[email] Failed to send email:", err);
    return false;
  }
}

/**
 * Render a booking confirmation email body.
 */
export function renderConfirmationEmail(params: {
  bookerName: string;
  bookingTypeName: string;
  date: string;
  time: string;
  durationMinutes: number;
  isFree: boolean;
  amountPaid?: number;
  meetingLink?: string;
}): string {
  const { bookerName, bookingTypeName, date, time, durationMinutes, isFree, amountPaid, meetingLink } = params;
  const formattedDate = new Date(date + "T" + time + ":00Z").toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Asia/Muscat",
  });
  const durationLabel = durationMinutes < 60 ? `${durationMinutes} minutes` : `${durationMinutes / 60} hour${durationMinutes > 60 ? "s" : ""}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0b1e;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#00d4ff;font-size:24px;margin:0;">BrainPower AI</h1>
      <p style="color:#8888aa;font-size:13px;margin:4px 0 0;">Investor Intelligence Platform</p>
    </div>

    <div style="background:#0d0e24;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Booking Confirmed ✓</h2>
      <p style="color:#8888aa;font-size:14px;margin:0 0 24px;">Hi ${bookerName}, your session has been confirmed.</p>

      <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;width:40%;">Session</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;font-weight:600;">${bookingTypeName}</td>
          </tr>
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;">Date &amp; Time</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;">Duration</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;">${durationLabel}</td>
          </tr>
          ${!isFree && amountPaid ? `
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;">Amount Paid</td>
            <td style="color:#00d4ff;font-size:13px;padding:6px 0;font-weight:600;">$${(amountPaid / 100).toFixed(0)}</td>
          </tr>` : ""}
        </table>
      </div>

      ${meetingLink ? `
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${meetingLink}" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#b24bf3);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Join Meeting
        </a>
      </div>` : ""}

      <p style="color:#8888aa;font-size:13px;margin:0;">
        Need to reschedule or have questions? Reply to this email or contact us at
        <a href="mailto:contact@brainpower.ai" style="color:#00d4ff;">contact@brainpower.ai</a>
      </p>
    </div>

    <p style="color:#555577;font-size:11px;text-align:center;margin-top:24px;">
      © ${new Date().getFullYear()} BrainPower AI · All rights reserved
    </p>
  </div>
</body>
</html>`;
}

/**
 * Render a booking reminder email body (24h before).
 */
export function renderReminderEmail(params: {
  bookerName: string;
  bookingTypeName: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingLink?: string;
}): string {
  const { bookerName, bookingTypeName, date, time, durationMinutes, meetingLink } = params;
  const formattedDate = new Date(date + "T" + time + ":00Z").toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Asia/Muscat",
  });
  const durationLabel = durationMinutes < 60 ? `${durationMinutes} minutes` : `${durationMinutes / 60} hour${durationMinutes > 60 ? "s" : ""}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0b1e;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#00d4ff;font-size:24px;margin:0;">BrainPower AI</h1>
    </div>

    <div style="background:#0d0e24;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Reminder: Session Tomorrow</h2>
      <p style="color:#8888aa;font-size:14px;margin:0 0 24px;">Hi ${bookerName}, this is a reminder about your upcoming session.</p>

      <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;width:40%;">Session</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;font-weight:600;">${bookingTypeName}</td>
          </tr>
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;">Date &amp; Time</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:#8888aa;font-size:13px;padding:6px 0;">Duration</td>
            <td style="color:#ffffff;font-size:13px;padding:6px 0;">${durationLabel}</td>
          </tr>
        </table>
      </div>

      ${meetingLink ? `
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${meetingLink}" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#b24bf3);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Join Meeting
        </a>
      </div>` : ""}

      <p style="color:#8888aa;font-size:13px;margin:0;">We look forward to speaking with you!</p>
    </div>
  </div>
</body>
</html>`;
}
