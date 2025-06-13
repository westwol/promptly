"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { api } from "../../../convex/_generated/api";

import { ConversationData } from "@t3chat/app/conversations/[id]/types";
import { ChatMessage } from "./ChatMessage/ChatMessage";
import { Doc } from "../../../convex/_generated/dataModel";
import { ThinkingIndicator } from "./ThinkingIndicator/ThinkingIndicator";
import clsx from "clsx";
import { ArrowUp } from "lucide-react";

const shouldDisplayThinkingIndicator = (messages: Doc<"messages">[]) => {
  if (messages.length === 0) {
    return false;
  }
  const lastMessage = messages[messages.length - 1];
  return (
    (lastMessage.status === "streaming" && lastMessage.content.length === 0) ||
    lastMessage.role === "user"
  );
};

interface ChatConversationProps {
  initialConversationData: ConversationData;
}

export const ChatConversation = ({
  initialConversationData,
}: ChatConversationProps) => {
  const client = useConvex();

  const addMessageToConversation = useMutation(
    api.conversations.addNewMessageToConversation,
  );

  const [messages, setMessages] = useState<Doc<"messages">[]>(
    initialConversationData.messages,
  );

  const [body, setBody] = useState<string>("");
  const isStreamingResponse = useRef<boolean>(false);
  const lastStreamReceived = useRef<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const shouldShowThinkingIndicator = shouldDisplayThinkingIndicator(messages);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
  }, []);

  const onSendRequest = async () => {
    const conversationId = initialConversationData.conversation._id;

    const generatedResumableStreamId = uuidv4();

    addMessageToConversation({
      conversationId,
      content: body,
      role: "user",
      status: "complete",
    });

    const currentDate = new Date().toISOString();

    setMessages((messages) => [
      ...messages,
      {
        _id: "temporal-id",
        status: "complete",
        role: "user",
        content: body,
        createdAt: currentDate,
        updatedAt: currentDate,
      } as Doc<"messages">,
    ]);
    setBody("");

    fetch("http://localhost:4000/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        resumableStreamId: generatedResumableStreamId,
        messages: [{ role: "user", content: body }],
      }),
    });
  };

  const onStartResumableStream = (streamId: string) => {
    // Clean up previous event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `http://localhost:4000/api/chat/stream?streamId=${streamId}`,
    );

    eventSourceRef.current = eventSource;
    lastStreamReceived.current = streamId;

    eventSource.onopen = () => {
      isStreamingResponse.current = true;
    };

    eventSource.onmessage = (event) => {
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId) {
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + event.data.replace(/\\n/g, "\n"),
          };
          return [...messages.slice(0, -1), updatedMessage];
        }
        return messages;
      });
    };

    eventSource.addEventListener("done", () => {
      console.log("Stream completed, closing connection");
      eventSource.close();
      isStreamingResponse.current = false;
    });

    eventSource.onerror = (err) => {
      console.error("SSE error", err);
    };
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    console.log({ lastMessage });

    if (!lastMessage?.resumableStreamId) {
      return;
    }

    if (lastMessage.resumableStreamId === lastStreamReceived.current) {
      return;
    }

    if (lastMessage?.status !== "streaming") {
      return;
    }

    if (isStreamingResponse.current) {
      return;
    }

    console.log("trigger from useEffect");
    lastStreamReceived.current = lastMessage.resumableStreamId;
    onStartResumableStream(lastMessage.resumableStreamId);
  }, [messages]);

  useEffect(() => {
    const watch = client.watchQuery(api.conversations.getById, {
      conversationUuid: initialConversationData.conversation.conversationUuid,
    });

    const unsubscribe = watch.onUpdate(() => {
      const result = watch.localQueryResult();
      const messages = result?.messages || [];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.resumableStreamId === lastStreamReceived.current) {
        return;
      }
      setMessages(result?.messages || []);
    });

    return () => {
      unsubscribe();
    };
  }, [client, initialConversationData.conversation.conversationUuid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen">
      <div
        className="overflow-auto"
        ref={messagesContainerRef}
        style={{ scrollBehavior: "auto" }}
      >
        <div className="text-white flex flex-col gap-2 mx-auto w-full max-w-3xl space-y-12 px-4 pb-10 pt-4 whitespace-pre-wrap break-words">
          {messages.map((m, i) => (
            <div
              key={i}
              className={clsx(
                "my-1",
                m.role === "user" && "ml-auto bg-[#2C2632] rounded-md p-3",
              )}
            >
              <ChatMessage content={m.content} />
            </div>
          ))}
          {shouldShowThinkingIndicator && <ThinkingIndicator />}
        </div>
      </div>
      <div className="relative mx-auto flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2C2632] px-3 pt-3 text-secondary-foreground max-sm:pb-6 sm:max-w-3xl">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full resize-none bg-transparent leading-6 text-white outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
          placeholder="Type your message here..."
        />
        <button
          className="absolute bottom-5 right-5 flex items-center justify-center z-10 w-9 h-9 rounded-md send-button disabled:opacity-70"
          onClick={onSendRequest}
          disabled={body.length === 0}
        >
          <ArrowUp color="white" size={20} />
        </button>
      </div>
    </div>
  );
};
