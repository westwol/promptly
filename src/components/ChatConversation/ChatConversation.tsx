"use client";

import { useEffect, useRef, useState } from "react";
import { Preloaded } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ChatConversationProps {
  conversation: Preloaded<typeof api.conversations.getById>;
}

export const ChatConversation = ({ conversation }: ChatConversationProps) => {
  const [body, setBody] = useState<string>("");
  const [reply, setReply] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem("chatSessionId"),
  );
  const [lastIndex, setLastIndex] = useState<number>(() =>
    Number(localStorage.getItem("chatLastIndex") ?? -1),
  );
  const wsRef = useRef<any>(null);

  const connect = () => {
    const ws = new WebSocket("ws://localhost:4000/conversation");
    wsRef.current = ws;

    ws.onopen = () => {
      const storedSession = localStorage.getItem("chatSessionId");
      const storedIndex = Number(localStorage.getItem("chatLastIndex") ?? -1);
      if (storedSession) {
        ws.send(
          JSON.stringify({
            type: "resume",
            sessionId: storedSession,
            lastIndex: storedIndex,
          }),
        );
      }
    };

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "session":
          setSessionId(msg.sessionId);
          setLastIndex(-1);
          localStorage.setItem("chatSessionId", msg.sessionId);
          localStorage.setItem("chatLastIndex", "-1");
          break;
        case "token":
          setReply((r) => r + msg.token);
          setLastIndex(msg.index);
          localStorage.setItem("chatLastIndex", String(msg.index));
          break;
        case "done":
          console.log("Stream finished");
          break;
        case "error":
          console.error("Error:", msg.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log("Disconnected, retrying in 1s…");
      setTimeout(connect, 1000);
    };
  };

  // Establish the socket once
  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  const onSendRequest = () => {
    // reset state
    setReply("");
    setLastIndex(-1);

    wsRef.current.send(
      JSON.stringify({
        type: "start",
        model: "gpt-4o-mini",
        content: body,
      }),
    );
    setBody("");
  };

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen overflow-auto">
      <div className="text-white whitespace-pre">
        {JSON.stringify(conversation, null, 2)}
        {reply && <p>{reply}</p>}
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
