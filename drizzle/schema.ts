import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const updatedAtCol = () =>
  timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date());

/**
 * Core user table backing auth flow.
 * Extended with admin roles and 2FA support.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role", { enum: ["user", "admin", "super_admin", "content_manager", "investor_admin"] }).default("user").notNull(),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Content blocks for dynamic website management
 */
export const contentBlocks = pgTable("contentBlocks", {
  id: serial("id").primaryKey(),
  blockKey: varchar("blockKey", { length: 100 }).notNull().unique(),
  blockType: text("blockType", { enum: ["hero", "concept", "investor_block", "metric", "text", "image", "video"] }).notNull(),
  title: text("title"),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  metadata: jsonb("metadata"),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: integer("createdBy").notNull(),
  updatedBy: integer("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = typeof contentBlocks.$inferInsert;

/**
 * Content version history for rollback capability
 */
export const contentVersions = pgTable("contentVersions", {
  id: serial("id").primaryKey(),
  blockId: integer("blockId").notNull(),
  versionNumber: integer("versionNumber").notNull(),
  title: text("title"),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  metadata: jsonb("metadata"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = typeof contentVersions.$inferInsert;

/**
 * Investor users with access levels
 */
export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  accessLevel: text("accessLevel", { enum: ["full", "read_only", "limited"] }).default("limited").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "suspended"] }).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: integer("approvedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = typeof investors.$inferInsert;

/**
 * Secure investor documents
 */
export const investorDocuments = pgTable("investorDocuments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  documentType: text("documentType", { enum: ["executive_summary", "roadmap", "financial_summary", "legal_structure", "other"] }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: integer("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  accessLevel: text("accessLevel", { enum: ["full", "read_only", "limited"] }).default("full").notNull(),
  uploadedBy: integer("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type InvestorDocument = typeof investorDocuments.$inferSelect;
export type InsertInvestorDocument = typeof investorDocuments.$inferInsert;

/**
 * Document access logs
 */
export const documentAccessLogs = pgTable("documentAccessLogs", {
  id: serial("id").primaryKey(),
  documentId: integer("documentId").notNull(),
  investorId: integer("investorId").notNull(),
  action: text("action", { enum: ["view", "download"] }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  accessedAt: timestamp("accessedAt").defaultNow().notNull(),
});

export type DocumentAccessLog = typeof documentAccessLogs.$inferSelect;
export type InsertDocumentAccessLog = typeof documentAccessLogs.$inferInsert;

/**
 * Media library for images and videos
 */
export const mediaLibrary = pgTable("mediaLibrary", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  altText: varchar("altText", { length: 255 }),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: integer("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  mediaType: text("mediaType", { enum: ["image", "video"] }).notNull(),
  width: integer("width"),
  height: integer("height"),
  copyright: text("copyright"),
  uploadedBy: integer("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type MediaLibrary = typeof mediaLibrary.$inferSelect;
export type InsertMediaLibrary = typeof mediaLibrary.$inferInsert;

/**
 * Analytics events tracking
 */
export const analyticsEvents = pgTable("analyticsEvents", {
  id: serial("id").primaryKey(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventData: jsonb("eventData"),
  blockKey: varchar("blockKey", { length: 100 }),
  userId: integer("userId"),
  investorId: integer("investorId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Audit logs for admin actions
 */
export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: integer("entityId"),
  changes: jsonb("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Notifications for admin users
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Scheduled content publishing
 */
export const scheduledPublishing = pgTable("scheduledPublishing", {
  id: serial("id").primaryKey(),
  blockId: integer("blockId").notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  status: text("status", { enum: ["pending", "published", "cancelled"] }).default("pending").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type ScheduledPublishing = typeof scheduledPublishing.$inferSelect;
export type InsertScheduledPublishing = typeof scheduledPublishing.$inferInsert;

/**
 * Contact form submissions from the Investors portal
 */
export const investorContacts = pgTable("investorContacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  investmentRange: varchar("investmentRange", { length: 100 }),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "contacted", "in_progress", "closed"] }).default("new").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type InvestorContact = typeof investorContacts.$inferSelect;
export type InsertInvestorContact = typeof investorContacts.$inferInsert;

/**
 * Investor interest events — CTA clicks, page views, FAQ interactions
 */
export const investorInterestEvents = pgTable("investorInterestEvents", {
  id: serial("id").primaryKey(),
  eventType: text("eventType", {
    enum: [
      "schedule_call_click",
      "download_brief_click",
      "contact_form_submit",
      "faq_open",
      "invest_now_click",
      "page_view",
    ],
  }).notNull(),
  metadata: jsonb("metadata"),
  sessionId: varchar("sessionId", { length: 128 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorInterestEvent = typeof investorInterestEvents.$inferSelect;
export type InsertInvestorInterestEvent = typeof investorInterestEvents.$inferInsert;

// ============================================================
// NATIVE BOOKING SYSTEM TABLES
// ============================================================

export const bookingTypes = pgTable("bookingTypes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("durationMinutes").notNull(),
  price: integer("price").default(0).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  isFree: boolean("isFree").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  color: varchar("color", { length: 20 }).default("#00d4ff"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type BookingType = typeof bookingTypes.$inferSelect;
export type InsertBookingType = typeof bookingTypes.$inferInsert;

export const availabilitySchedules = pgTable("availabilitySchedules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  timezone: varchar("timezone", { length: 100 }).default("Asia/Muscat").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;
export type InsertAvailabilitySchedule = typeof availabilitySchedules.$inferInsert;

export const availabilitySlots = pgTable("availabilitySlots", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId").notNull(),
  dayOfWeek: integer("dayOfWeek").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertAvailabilitySlot = typeof availabilitySlots.$inferInsert;

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingTypeId: integer("bookingTypeId").notNull(),
  bookerName: varchar("bookerName", { length: 255 }).notNull(),
  bookerEmail: varchar("bookerEmail", { length: 320 }).notNull(),
  bookerCompany: varchar("bookerCompany", { length: 255 }),
  bookerPhone: varchar("bookerPhone", { length: 50 }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled", "no_show"] }).default("pending").notNull(),
  paymentStatus: text("paymentStatus", { enum: ["not_required", "pending", "paid", "refunded", "failed"] }).default("not_required").notNull(),
  paymentAmount: integer("paymentAmount").default(0),
  paymentReference: varchar("paymentReference", { length: 255 }),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: integer("discountAmount").default(0),
  notes: text("notes"),
  meetingLink: text("meetingLink"),
  confirmationEmailSent: boolean("confirmationEmailSent").default(false).notNull(),
  reminderEmailSent: boolean("reminderEmailSent").default(false).notNull(),
  followUpEmailSent: boolean("followUpEmailSent").default(false).notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const bookingContacts = pgTable("bookingContacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  totalBookings: integer("totalBookings").default(0).notNull(),
  lastBookedAt: timestamp("lastBookedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type BookingContact = typeof bookingContacts.$inferSelect;
export type InsertBookingContact = typeof bookingContacts.$inferInsert;

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: text("discountType", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: integer("discountValue").notNull(),
  maxUses: integer("maxUses"),
  usesCount: integer("usesCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export const bookingReviews = pgTable("bookingReviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").notNull(),
  bookingTypeId: integer("bookingTypeId").notNull(),
  bookerName: varchar("bookerName", { length: 255 }).notNull(),
  bookerEmail: varchar("bookerEmail", { length: 320 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type BookingReview = typeof bookingReviews.$inferSelect;
export type InsertBookingReview = typeof bookingReviews.$inferInsert;

export const emailTemplates = pgTable("emailTemplates", {
  id: serial("id").primaryKey(),
  triggerEvent: text("triggerEvent", { enum: ["booking_confirmed", "booking_cancelled", "booking_reminder", "booking_followup"] }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
