"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

import { ConversationData } from "@t3chat/app/conversations/[id]/types";
import { ChatMessage } from "./ChatMessage/ChatMessage";
import { Doc } from "../../../convex/_generated/dataModel";
import { ThinkingIndicator } from "./ThinkingIndicator/ThinkingIndicator";
import clsx from "clsx";

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
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const shouldShowThinkingIndicator =
    messages.length > 0 &&
    messages[messages.length - 1].status === "streaming" &&
    messages[messages.length - 1].content.length === 0;

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
  }, []);

  const onSendRequest = async () => {
    const conversationId = initialConversationData.conversation._id;

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

    const res = await fetch("http://localhost:4000/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messages: [{ role: "user", content: body }],
      }),
    });
    const { streamId } = await res.json();
    onStartResumableStream(streamId);
    console.log("trigger from api chat start");
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

    eventSource.onopen = () => {
      isStreamingResponse.current = true;
    };

    eventSource.onmessage = (event) => {
      const chunk = JSON.parse(event.data);
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.resumableStreamId) {
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunk.text,
          };
          return [...messages.slice(0, -1), updatedMessage];
        }
        return messages;
      });
    };

    eventSource.addEventListener("done", () => {
      console.log("Stream completed, closing connection");
      eventSource.close();
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        if (
          lastMessage?.resumableStreamId &&
          lastMessage.status === "streaming"
        ) {
          const updatedMessage: Doc<"messages"> = {
            ...lastMessage,
            status: "complete",
          };
          return [...messages.slice(0, -1), updatedMessage];
        }
        return messages;
      });
      isStreamingResponse.current = false;
    });

    eventSource.onerror = (err) => {
      console.error("SSE error", err);
    };
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.resumableStreamId) {
      return;
    }

    if (lastMessage?.status !== "streaming") {
      return;
    }

    if (isStreamingResponse.current) {
      return;
    }

    console.log("trigger from useEffect");
    onStartResumableStream(lastMessage.resumableStreamId);
  }, [messages]);

  useEffect(() => {
    const watch = client.watchQuery(api.conversations.getById, {
      conversationUuid: initialConversationData.conversation.conversationUuid,
    });

    const unsubscribe = watch.onUpdate(() => {
      const result = watch.localQueryResult();
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
    <div className="grid grid-rows-[1fr_100px] h-screen overflow-auto">
      <div
        ref={messagesContainerRef}
        className="text-white flex flex-col gap-2"
        style={{
          height: "100%",
          overflowY: "auto",
          padding: 8,
          scrollBehavior: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              "my-1",
              m.role === "user" && "ml-auto bg-gray-800 rounded-md p-3",
            )}
          >
            {m.role === "user" && <strong>You:</strong>}
            <ChatMessage content={m.content} />
          </div>
        ))}
        {shouldShowThinkingIndicator && <ThinkingIndicator />}
      </div>
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="bg-primary w-full h-full text-white outline-0"
          placeholder="type something here"
        />
        <button
          className="absolute bottom-5 right-5 z-10 bg-blue-500 p-2"
          onClick={onSendRequest}
        >
          Send
        </button>
      </div>
    </div>
  );
};
