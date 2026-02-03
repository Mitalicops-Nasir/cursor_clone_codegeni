import { processMessage } from "@/features/conversations/inngest/process-message";
import { inngest } from "@/inngest/client";
import { demoGenerate } from "@/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    demoGenerate,
    processMessage,
  ],
});
