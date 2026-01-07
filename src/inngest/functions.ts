import { generateText } from "ai";
import { inngest } from "./client";
import { google } from "@/app/api/demo/blocking/route";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    await step.run("generateText", async () => {
      const response = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: "hello bro",
      });

      return response;
    });
  }
);
