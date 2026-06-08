import { eq, desc, and, sql, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { 
  InsertUser, users,
  contentBlocks, InsertContentBlock, ContentBlock,
  contentVersions, InsertContentVersion,
  investors, InsertInvestor, Investor,
  investorDocuments, InsertInvestorDocument,
  documentAccessLogs, InsertDocumentAccessLog,
  mediaLibrary, InsertMediaLibrary,
  analyticsEvents, InsertAnalyticsEvent,
  auditLogs, InsertAuditLog,
  notifications, InsertNotification,
  scheduledPublishing, InsertScheduledPublishing
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) return false;

  await db.update(users).set({ role: role as any }).where(eq(users.id, userId));
  return true;
}

// ============================================
// CONTENT BLOCKS
// ============================================

export async function getContentBlock(blockKey: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contentBlocks).where(eq(contentBlocks.blockKey, blockKey)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllContentBlocks(status?: string) {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return await db.select().from(contentBlocks).where(eq(contentBlocks.status, status as any)).orderBy(desc(contentBlocks.updatedAt));
  }
  return await db.select().from(contentBlocks).orderBy(desc(contentBlocks.updatedAt));
}

export async function createContentBlock(block: InsertContentBlock) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contentBlocks).values(block);
  return result;
}

export async function updateContentBlock(blockId: number, updates: Partial<ContentBlock>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create version before updating
  const current = await db.select().from(contentBlocks).where(eq(contentBlocks.id, blockId)).limit(1);
  if (current.length > 0) {
    const block = current[0];
    const versions = await db.select().from(contentVersions).where(eq(contentVersions.blockId, blockId)).orderBy(desc(contentVersions.versionNumber)).limit(1);
    const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    await db.insert(contentVersions).values({
      blockId: block.id,
      versionNumber: nextVersion,
      title: block.title,
      content: block.content,
      mediaUrl: block.mediaUrl,
      metadata: block.metadata,
      createdBy: userId,
    });
  }

  await db.update(contentBlocks).set({ ...updates, updatedBy: userId }).where(eq(contentBlocks.id, blockId));
  return true;
}

export async function deleteContentBlock(blockId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(contentBlocks).where(eq(contentBlocks.id, blockId));
  return true;
}

export async function getContentVersions(blockId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contentVersions).where(eq(contentVersions.blockId, blockId)).orderBy(desc(contentVersions.versionNumber));
}

export async function rollbackContentVersion(blockId: number, versionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const version = await db.select().from(contentVersions).where(eq(contentVersions.id, versionId)).limit(1);
  if (version.length === 0) throw new Error("Version not found");

  const v = version[0];
  await updateContentBlock(blockId, {
    title: v.title,
    content: v.content,
    mediaUrl: v.mediaUrl,
    metadata: v.metadata,
  }, userId);

  return true;
}

// ============================================
// INVESTORS
// ============================================

export async function getAllInvestors(status?: string) {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return await db.select().from(investors).where(eq(investors.status, status as any)).orderBy(desc(investors.requestedAt));
  }
  return await db.select().from(investors).orderBy(desc(investors.requestedAt));
}

export async function getInvestorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(investors).where(eq(investors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInvestor(investor: InsertInvestor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(investors).values(investor);
  return result;
}

export async function updateInvestor(id: number, updates: Partial<Investor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(investors).set(updates).where(eq(investors.id, id));
  return true;
}

export async function approveInvestor(id: number, approvedBy: number, accessLevel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(investors).set({
    status: 'approved',
    accessLevel: accessLevel as any,
    approvedAt: new Date(),
    approvedBy,
  }).where(eq(investors.id, id));

  return true;
}

export async function rejectInvestor(id: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(investors).set({
    status: 'rejected',
    notes,
  }).where(eq(investors.id, id));

  return true;
}

// ============================================
// INVESTOR DOCUMENTS
// ============================================

export async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(investorDocuments).orderBy(desc(investorDocuments.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(investorDocuments).where(eq(investorDocuments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(doc: InsertInvestorDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(investorDocuments).values(doc);
  return result;
}

export async function updateDocument(id: number, updates: Partial<InsertInvestorDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(investorDocuments).set(updates).where(eq(investorDocuments.id, id));
  return true;
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(investorDocuments).where(eq(investorDocuments.id, id));
  return true;
}

// ============================================
// DOCUMENT ACCESS LOGS
// ============================================

export async function logDocumentAccess(log: InsertDocumentAccessLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(documentAccessLogs).values(log);
}

export async function getDocumentAccessLogs(documentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(documentAccessLogs).where(eq(documentAccessLogs.documentId, documentId)).orderBy(desc(documentAccessLogs.accessedAt));
}

// ============================================
// MEDIA LIBRARY
// ============================================

export async function getAllMedia(mediaType?: string) {
  const db = await getDb();
  if (!db) return [];

  if (mediaType) {
    return await db.select().from(mediaLibrary).where(eq(mediaLibrary.mediaType, mediaType as any)).orderBy(desc(mediaLibrary.createdAt));
  }
  return await db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
}

export async function getMediaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMedia(media: InsertMediaLibrary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mediaLibrary).values(media);
  return result;
}

export async function updateMedia(id: number, updates: Partial<InsertMediaLibrary>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(mediaLibrary).set(updates).where(eq(mediaLibrary.id, id));
  return true;
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
  return true;
}

// ============================================
// ANALYTICS
// ============================================

export async function trackEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return;

  await db.insert(analyticsEvents).values(event);
}

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(analyticsEvents);
  
  if (startDate && endDate) {
    query = query.where(
      and(
        sql`${analyticsEvents.createdAt} >= ${startDate}`,
        sql`${analyticsEvents.createdAt} <= ${endDate}`
      )
    ) as any;
  }

  return await query.orderBy(desc(analyticsEvents.createdAt));
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return {};

  const totalEvents = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvents);
  const totalInvestors = await db.select({ count: sql<number>`count(*)` }).from(investors);
  const pendingInvestors = await db.select({ count: sql<number>`count(*)` }).from(investors).where(eq(investors.status, 'pending'));
  const totalDocuments = await db.select({ count: sql<number>`count(*)` }).from(investorDocuments);

  return {
    totalEvents: totalEvents[0]?.count || 0,
    totalInvestors: totalInvestors[0]?.count || 0,
    pendingInvestors: pendingInvestors[0]?.count || 0,
    totalDocuments: totalDocuments[0]?.count || 0,
  };
}

// ============================================
// AUDIT LOGS
// ============================================

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return;

  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  if (unreadOnly) {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ============================================
// SCHEDULED PUBLISHING
// ============================================

export async function createScheduledPublish(schedule: InsertScheduledPublishing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scheduledPublishing).values(schedule);
  return result;
}

export async function getPendingScheduledPublishes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(scheduledPublishing)
    .where(and(
      eq(scheduledPublishing.status, 'pending'),
      sql`${scheduledPublishing.scheduledFor} <= NOW()`
    ))
    .orderBy(scheduledPublishing.scheduledFor);
}

export async function markScheduledPublishComplete(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(scheduledPublishing).set({
    status: 'published',
    publishedAt: new Date(),
  }).where(eq(scheduledPublishing.id, id));
}
