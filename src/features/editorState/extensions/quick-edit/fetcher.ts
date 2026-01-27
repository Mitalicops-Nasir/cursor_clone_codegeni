import ky from "ky";
import { z } from "zod";
import { toast } from "sonner";

const editRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

const editResponseSchema = z.object({
  editedCode: z.string(),
});

type editRequest = z.infer<typeof editRequestSchema>;
type editResponse = z.infer<typeof editResponseSchema>;

export const fetcher = async (
  payload: editRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const validatePayload = editRequestSchema.parse(payload);

    const response = await ky
      .post("/api/quick-edit", {
        json: validatePayload,
        signal: signal,
        timeout: 30_000,
        retry: 0,
      })
      .json<editResponse>();

    const validatedResponse = editResponseSchema.parse(response);

    return validatedResponse.editedCode;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("Failed to fetch AI quick edit");

    return null;
  }
};
