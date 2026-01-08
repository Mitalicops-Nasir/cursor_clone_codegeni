import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const verifyAuth = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
};
