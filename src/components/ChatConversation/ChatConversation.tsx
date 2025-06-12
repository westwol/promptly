"use client";

import { useEffect, useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

import { ConversationData } from "@t3chat/app/conversations/[id]/types";
import { ChatMessage } from "./ChatMessage/ChatMessage";
import { Doc } from "../../../convex/_generated/dataModel";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const watch = client.watchQuery(api.conversations.getById, {
      conversationId: initialConversationData.conversation._id,
    });

    const unsubscribe = watch.onUpdate(() => {
      const result = watch.localQueryResult();
      setMessages(result?.messages || []);
      console.log({ result });
    });

    return () => {
      unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    console.log("change conversationData?");
  }, [initialConversationData]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  const onSendRequest = async () => {
    const conversationId = initialConversationData.conversation._id;

    addMessageToConversation({
      conversationId,
      content: body,
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

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen overflow-auto">
      <div
        ref={messagesContainerRef}
        className="text-white"
        style={{
          height: "100%",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 8,
          scrollBehavior: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "4px 0" }}>
            <strong>{m.role === "user" ? "You" : "GPT"}:</strong>
            <ChatMessage content={m.content} />
          </div>
        ))}
        <div ref={messagesEndRef} style={{ scrollMarginBottom: "20px" }} />
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
