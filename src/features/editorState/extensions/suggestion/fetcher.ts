import ky from "ky";
import { z } from "zod";
import { toast } from "sonner";

const suggestionRequestSchema = z.object({
  fileName: z.string(),
  code: z.string(),
  previousLines: z.string(),
  currentLine: z.string(),
  lineNumber: z.number(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
});

const suggestionResponseSchema = z.object({
  suggestion: z.string(),
});

type suggestionRequest = z.infer<typeof suggestionRequestSchema>;
type suggestionResponse = z.infer<typeof suggestionResponseSchema>;

export const fetcher = async (
  payload: suggestionRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {


    const validatePayload = suggestionRequestSchema.parse(payload);

    const response = await ky
      .post("/api/suggestion", {
        json: validatePayload,
        signal: signal,
        timeout: 10_000,
        retry: 0,
      })
      .json<suggestionResponse>();

    const validatedResponse = suggestionResponseSchema.parse(response);

    return validatedResponse.suggestion;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("Failed to fetch AI completion");

    return null;
  }
};
