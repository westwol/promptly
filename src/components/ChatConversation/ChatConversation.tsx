"use client";

import { useEffect, useRef, useState } from "react";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ChatConversationProps {
  conversation: Preloaded<typeof api.conversations.getById>;
}

export const ChatConversation = ({ conversation }: ChatConversationProps) => {
  const conversationData = usePreloadedQuery(conversation);

  const addMessageToConversation = useMutation(
    api.conversations.addNewMessageToConversation,
  );

  const [body, setBody] = useState<string>("");
  const [messages, setMessages] = useState<any[]>(conversationData.messages);
  const [streamId, setStreamId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData.messages]);

  const onSendRequest = async () => {
    const conversationId = conversationData.conversation._id;

    addMessageToConversation({
      conversationId,
      content: body,
    });

    // 2) Start the OpenAI job and get a streamId
    const res = await fetch("http://localhost:4000/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messages: conversationData.messages,
      }),
    });
    const { streamId } = await res.json();
    setStreamId(streamId);
  };

  // Whenever we get a new streamId, open (or reopen) the SSE connection
  useEffect(() => {
    if (!streamId) return;

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(
      `http://localhost:4000/api/chat/stream?streamId=${streamId}`,
    );
    console.log({ es });
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      // each e.data is the next token chunk
      setMessages((msgs) => {
        // append to the last "assistant" message or start a new one
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") {
          last.content += e.data;
          return [...msgs.slice(0, -1), last];
        } else {
          return [...msgs, { role: "assistant", content: e.data }];
        }
      });
    };

    es.onerror = (err) => {
      console.error("SSE error", err);
      // you can implement retry logic here if needed
    };

    return () => {
      es.close();
    };
  }, [streamId]);

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen overflow-auto">
      <div
        className="text-white"
        style={{
          height: '100%',
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 8,
        }}
      >
        {conversationData.messages.map((m, i) => (
          <div key={i} style={{ margin: "4px 0" }}>
            <strong>{m.role === "user" ? "You" : "GPT"}:</strong> {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
