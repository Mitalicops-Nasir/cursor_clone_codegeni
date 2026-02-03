import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex.client";
import { api } from "../../../../convex/_generated/api";

interface MessageEvent {
  messageId: Id<"messages">;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = process.env.CONVEX_INTERNAL_KEY;

      //Update the message with error content
      if (internalKey) {
        await step.run("update-assistant-message", async () => {
          await convex.mutation(api.systemFunc.updateMessageContent, {
            internalKey: internalKey,
            messageId: messageId,
            content: "AI FAILED TO PROCESS YOUR MESSAGE (TODO)",
          });
        });
      }
    },
  },
  {
    event: "message/sent",
  },

  async ({ event, step }) => {
    const { messageId } = event.data as MessageEvent;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError("Missing internal key");
    }

    await step.sleep("wait-for-ai-processing", "5s");

    await step.run("update-assistant-message", async () => {
      await convex.mutation(api.systemFunc.updateMessageContent, {
        internalKey: internalKey,
        messageId: messageId,
        content: "AI HAS PROCESSED YOUR MESSAGE (TODO)",
      });
    });
  },
);
