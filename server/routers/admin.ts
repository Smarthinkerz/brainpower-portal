import { z } from "zod";
import { adminProcedure, superAdminProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { nanoid } from "nanoid";

export const adminRouter = router({
  // ============================================
  // DASHBOARD OVERVIEW
  // ============================================
  getDashboardStats: adminProcedure.query(async () => {
    const stats = await db.getAnalyticsSummary();
    const recentLogs = await db.getAuditLogs(10);
    const pendingInvestors = await db.getAllInvestors('pending');

    return {
      stats,
      recentActivity: recentLogs,
      pendingInvestors: pendingInvestors.length,
    };
  }),

  // ============================================
  // CONTENT MANAGEMENT
  // ============================================
  content: router({
    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllContentBlocks(input?.status);
      }),

    get: adminProcedure
      .input(z.object({ blockKey: z.string() }))
      .query(async ({ input }) => {
        return await db.getContentBlock(input.blockKey);
      }),

    create: adminProcedure
      .input(z.object({
        blockKey: z.string(),
        blockType: z.enum(["hero", "concept", "investor_block", "metric", "text", "image", "video"]),
        title: z.string().optional(),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        metadata: z.any().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createContentBlock({
          ...input,
          createdBy: ctx.user.id,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "content_create",
          entityType: "contentBlock",
          changes: { created: input },
        });

        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        blockId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        metadata: z.any().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { blockId, ...updates } = input;
        
        await db.updateContentBlock(blockId, updates, ctx.user.id);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "content_update",
          entityType: "contentBlock",
          entityId: blockId,
          changes: { updates },
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ blockId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteContentBlock(input.blockId);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "content_delete",
          entityType: "contentBlock",
          entityId: input.blockId,
        });

        return { success: true };
      }),

    publish: adminProcedure
      .input(z.object({ blockId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateContentBlock(input.blockId, {
          status: 'published',
          publishedAt: new Date(),
        }, ctx.user.id);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "content_publish",
          entityType: "contentBlock",
          entityId: input.blockId,
        });

        return { success: true };
      }),

    getVersions: adminProcedure
      .input(z.object({ blockId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContentVersions(input.blockId);
      }),

    upsert: adminProcedure
      .input(z.object({
        blockKey: z.string(),
        blockType: z.enum(["hero", "concept", "investor_block", "metric", "text", "image", "video"]),
        title: z.string().optional(),
        content: z.string().optional(),
        mediaUrl: z.string().optional(),
        metadata: z.any().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getContentBlock(input.blockKey);
        
        if (existing) {
          // Update existing block
          const { blockKey, blockType, ...updates } = input;
          await db.updateContentBlock(existing.id, updates, ctx.user.id);
          
          await db.createAuditLog({
            userId: ctx.user.id,
            action: "content_update",
            entityType: "contentBlock",
            entityId: existing.id,
            changes: { updates },
          });
          
          return { success: true, id: existing.id };
        } else {
          // Create new block
          await db.createContentBlock({
            ...input,
            createdBy: ctx.user.id,
          });
          
          // Get the created block to return its ID
          const created = await db.getContentBlock(input.blockKey);
          
          await db.createAuditLog({
            userId: ctx.user.id,
            action: "content_create",
            entityType: "contentBlock",
            entityId: created?.id,
            changes: { created: input },
          });
          
          return { success: true, id: created?.id };
        }
      }),

    rollback: adminProcedure
      .input(z.object({ blockId: z.number(), versionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.rollbackContentVersion(input.blockId, input.versionId, ctx.user.id);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "content_rollback",
          entityType: "contentBlock",
          entityId: input.blockId,
          changes: { versionId: input.versionId },
        });

        return { success: true };
      }),
  }),

  // ============================================
  // INVESTOR MANAGEMENT
  // ============================================
  investors: router({
    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllInvestors(input?.status);
      }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getInvestorById(input.id);
      }),

    approve: adminProcedure
      .input(z.object({
        id: z.number(),
        accessLevel: z.enum(["full", "read_only", "limited"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.approveInvestor(input.id, ctx.user.id, input.accessLevel);

        const investor = await db.getInvestorById(input.id);
        if (investor) {
          await db.createNotification({
            userId: ctx.user.id,
            type: "investor_approved",
            title: "Investor Approved",
            message: `${investor.name} has been approved with ${input.accessLevel} access`,
          });
        }

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "investor_approve",
          entityType: "investor",
          entityId: input.id,
          changes: { accessLevel: input.accessLevel },
        });

        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.rejectInvestor(input.id, input.notes);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "investor_reject",
          entityType: "investor",
          entityId: input.id,
          changes: { notes: input.notes },
        });

        return { success: true };
      }),

    updateAccessLevel: adminProcedure
      .input(z.object({
        id: z.number(),
        accessLevel: z.enum(["full", "read_only", "limited"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateInvestor(input.id, { accessLevel: input.accessLevel });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "investor_access_update",
          entityType: "investor",
          entityId: input.id,
          changes: { accessLevel: input.accessLevel },
        });

        return { success: true };
      }),

    suspend: adminProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateInvestor(input.id, { status: 'suspended', notes: input.notes });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "investor_suspend",
          entityType: "investor",
          entityId: input.id,
        });

        return { success: true };
      }),
  }),

  // ============================================
  // DOCUMENT MANAGEMENT
  // ============================================
  documents: router({
    list: adminProcedure.query(async () => {
      return await db.getAllDocuments();
    }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentById(input.id);
      }),

    upload: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        documentType: z.enum(["executive_summary", "roadmap", "financial_summary", "legal_structure", "other"]),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        accessLevel: z.enum(["full", "read_only", "limited"]).default("full"),
      }))
      .mutation(async ({ input, ctx }) => {
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `investor-documents/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        await db.createDocument({
          title: input.title,
          description: input.description,
          documentType: input.documentType,
          fileUrl: url,
          fileKey,
          fileName: input.fileName,
          fileSize: fileBuffer.length,
          mimeType: input.mimeType,
          accessLevel: input.accessLevel,
          uploadedBy: ctx.user.id,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document_upload",
          entityType: "document",
          changes: { fileName: input.fileName, type: input.documentType },
        });

        return { success: true, url };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        accessLevel: z.enum(["full", "read_only", "limited"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await db.updateDocument(id, updates);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document_update",
          entityType: "document",
          entityId: id,
          changes: updates,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteDocument(input.id);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document_delete",
          entityType: "document",
          entityId: input.id,
        });

        return { success: true };
      }),

    getAccessLogs: adminProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentAccessLogs(input.documentId);
      }),
  }),

  // ============================================
  // MEDIA LIBRARY
  // ============================================
  media: router({
    list: adminProcedure
      .input(z.object({ mediaType: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllMedia(input?.mediaType);
      }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaById(input.id);
      }),

    upload: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        altText: z.string().optional(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        mediaType: z.enum(["image", "video"]),
        width: z.number().optional(),
        height: z.number().optional(),
        copyright: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `media/${input.mediaType}s/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        await db.createMedia({
          title: input.title,
          description: input.description,
          altText: input.altText,
          fileUrl: url,
          fileKey,
          fileName: input.fileName,
          fileSize: fileBuffer.length,
          mimeType: input.mimeType,
          mediaType: input.mediaType,
          width: input.width,
          height: input.height,
          copyright: input.copyright,
          uploadedBy: ctx.user.id,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "media_upload",
          entityType: "media",
          changes: { fileName: input.fileName, type: input.mediaType },
        });

        return { success: true, url };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        altText: z.string().optional(),
        copyright: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await db.updateMedia(id, updates);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "media_update",
          entityType: "media",
          entityId: id,
          changes: updates,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteMedia(input.id);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "media_delete",
          entityType: "media",
          entityId: input.id,
        });

        return { success: true };
      }),
  }),

  // ============================================
  // ANALYTICS
  // ============================================
  analytics: router({
    summary: adminProcedure.query(async () => {
      return await db.getAnalyticsSummary();
    }),

    events: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAnalytics(input?.startDate, input?.endDate);
      }),
  }),

  // ============================================
  // AUDIT LOGS
  // ============================================
  auditLogs: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(100) }).optional())
      .query(async ({ input }) => {
        return await db.getAuditLogs(input?.limit || 100);
      }),
  }),

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: router({
    list: adminProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input?.unreadOnly || false);
      }),

    markRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: adminProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsRead(ctx.user.id);
        return { success: true };
      }),
  }),

  // ============================================
  // USER MANAGEMENT (Super Admin Only)
  // ============================================
  users: router({
    list: superAdminProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { users } = await import("../../drizzle/schema");
      return await dbInstance.select().from(users);
    }),

    updateRole: superAdminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "super_admin", "content_manager", "investor_admin"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserRole(input.userId, input.role);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "user_role_update",
          entityType: "user",
          entityId: input.userId,
          changes: { role: input.role },
        });

        return { success: true };
      }),
  }),

  // ============================================
  // 2FA MANAGEMENT
  // ============================================
  twoFactor: router({
    enable: adminProcedure.mutation(async ({ ctx }) => {
      const secret = speakeasy.generateSecret({
        name: `BrainPower AI (${ctx.user.email})`,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret temporarily (in real app, store in session or temp storage)
      // For now, return it to client to verify before enabling
      return {
        secret: secret.base32,
        qrCode,
      };
    }),

    verify: adminProcedure
      .input(z.object({
        token: z.string(),
        secret: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const verified = speakeasy.totp.verify({
          secret: input.secret,
          encoding: 'base32',
          token: input.token,
        });

        if (!verified) {
          throw new Error("Invalid token");
        }

        // Enable 2FA for user
        const dbInstance = await db.getDb();
        if (dbInstance) {
          const { users } = await import("../../drizzle/schema");
          await dbInstance.update(users)
            .set({
              twoFactorEnabled: true,
              twoFactorSecret: input.secret,
            })
            .where({ id: ctx.user.id } as any);
        }

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "2fa_enabled",
          entityType: "user",
          entityId: ctx.user.id,
        });

        return { success: true };
      }),

    disable: adminProcedure.mutation(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (dbInstance) {
        const { users } = await import("../../drizzle/schema");
        await dbInstance.update(users)
          .set({
            twoFactorEnabled: false,
            twoFactorSecret: null,
          })
          .where({ id: ctx.user.id } as any);
      }

      await db.createAuditLog({
        userId: ctx.user.id,
        action: "2fa_disabled",
        entityType: "user",
        entityId: ctx.user.id,
      });

      return { success: true };
    }),
  }),

  // ============================================
  // SCHEDULED PUBLISHING
  // ============================================
  scheduling: router({
    create: adminProcedure
      .input(z.object({
        blockId: z.number(),
        scheduledFor: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createScheduledPublish({
          blockId: input.blockId,
          scheduledFor: input.scheduledFor,
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),

    pending: adminProcedure.query(async () => {
      return await db.getPendingScheduledPublishes();
    }),
  }),
});
