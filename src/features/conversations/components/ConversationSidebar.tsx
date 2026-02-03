import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../convex/constants";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  HistoryIcon,
  Loader,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversations";
import { toast } from "sonner";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Prompt } from "ai";
import { tryLoadManifestWithRetries } from "next/dist/server/load-components";
import ky from "ky";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
}

const ConversationSidebar = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [input, SetInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const createConversation = useCreateConversation();

  const conversations = useConversations(projectId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId!);

  const conversationMessages = useMessages(activeConversationId);

  const isProcessing = conversationMessages?.some(
    (message) => message.status === "processing",
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId: projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });

      setSelectedConversationId(newConversationId);

      return newConversationId;
    } catch (error) {
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    //IF PROCESSING AND NO NEW MESSAGE, THIS IS JUST A STOP FUNCTION
    if (isProcessing && !message.text) {
      // await handleCancel();
      //return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();

      if (!conversationId) {
        return;
      }
    }

    // Trigger inngest function via api

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId: conversationId,
          message: message.text,
        },
      });
    } catch (error) {
      toast.error("Failed to send message");
    }

    SetInput("");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="h-8.75 flex items-center justify-between border-b">
        <div className="text-sm truncate pl-3">
          {activeConversation?.title ?? "Empty Conversation"}
        </div>

        <div className="flex items-center px-1 gap-1">
          <Button variant="highlight" size="icon-xs">
            <HistoryIcon className="size-3.5" />
          </Button>

          <Button
            onClick={handleCreateConversation}
            variant="highlight"
            size="icon-xs"
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      <Conversation className="flex-1">
        <ConversationContent>
          {conversationMessages?.map((message, messageIndex) => (
            <Message key={message._id} from={message.role}>
              <MessageContent>
                {message.status === "processing" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <MessageResponse>{message.content}</MessageResponse>
                )}
              </MessageContent>

              {message.role === "assistant" &&
                message.status === "completed" &&
                messageIndex === (conversationMessages.length ?? 0) - 1 && (
                  <MessageActions>
                    <MessageAction
                      onClick={() =>
                        navigator.clipboard.writeText(message.content)
                      }
                      label="Copy"
                    >
                      <CopyIcon className="size-4" />
                    </MessageAction>
                  </MessageActions>
                )}
            </Message>
          ))}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="p-3">
        <PromptInput onSubmit={handleSubmit} className="mt-2">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask Code Genie Anything..."
              onChange={(e) => SetInput(e.target.value)}
              value={input}
              disabled={isProcessing}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools />

            <PromptInputSubmit
              disabled={isProcessing ? false : !input}
              status={isProcessing ? "streaming" : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ConversationSidebar;
