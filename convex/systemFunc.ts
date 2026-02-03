import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Wwe use this so no one can exploit our convex functions here for malicious purposes
// cuz at the end of the day these convex functions are an api that we can call so that we can get data
// and these below one dont have any auth checks etc so anyone can call them so we will use internal key as a security measure
// this key is not a part of convex thing that they offer its our own custom thing

export const validateInternalKey = (key: string) => {
  const secret = process.env.CONVEX_INTERNAL_KEY;

  if (!secret) {
    throw new Error("Missing internal key");
  }

  if (secret !== key) {
    throw new Error("Unauthorized");
  }
};

export const getConverstaionById = query({
  args: {
    conversationid: v.id("conversations"),
    internalKey: v.string(),
  },

  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    return await ctx.db.get("conversations", args.conversationid);
  },
});

export const createMessage = mutation({
  args: {
    internalKey: v.string(),
    conversationId: v.id("conversations"),
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
  },

  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      projectId: args.projectId,
      role: args.role,
      content: args.content,
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.patch("conversations", args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;


  },
});

export const updateMessageContent = mutation({
  args: {
    internalKey: v.string(),
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    await ctx.db.patch(args.messageId, {
      content: args.content,
      status: "completed" as const,
    });
  },
});