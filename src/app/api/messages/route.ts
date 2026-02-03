import { convex } from "@/lib/convex.client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";

const requestSchema = z.object({
  conversationId: z.string(),
  message: z.string(),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Missing internal key" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { conversationId, message } = requestSchema.parse(body);

  const conversation = await convex.query(api.systemFunc.getConverstaionById, {
    conversationid: conversationId as Id<"conversations">,
    internalKey: internalKey,
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const projectId = conversation.projectId;

  //TODO: Check for processing messages

  await convex.mutation(api.systemFunc.createMessage, {
    internalKey: internalKey,
    conversationId: conversationId as Id<"conversations">,
    projectId: projectId as Id<"projects">,
    role: "user",
    content: message,
  });

  const assistantMessageId = await convex.mutation(
    api.systemFunc.createMessage,
    {
      internalKey: internalKey,
      conversationId: conversationId as Id<"conversations">,
      projectId: projectId as Id<"projects">,
      role: "assistant",
      content: "",
      status: "processing",
    },
  );

  const event = await inngest.send({
    name: "message/sent",
    data: {
      messageId: assistantMessageId,
    },
  });

  return NextResponse.json({
    success: true,
    eventId: event.ids[0],
    messageId: assistantMessageId,
  }); //TODO: Later use inngest eventID

  //Call convex mutation, query
  // invoke inngest background jobs
}
