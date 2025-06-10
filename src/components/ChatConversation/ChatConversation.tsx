"use client";

import { useEffect, useState } from "react";
import { Preloaded } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ChatConversationProps {
  conversation: Preloaded<typeof api.conversations.getById>;
}

export const ChatConversation = ({ conversation }: ChatConversationProps) => {
  const [body, setBody] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const onSendRequest = async () => {
    const req = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
        model: "gpt-3.5-turbo",
      }),
    });
    const data = await req.json();
    console.log({ data });
    setResponse(data?.reply || "");
  };

  useEffect(() => {
    const websocket = new WebSocket("http://localhost:4000/conversation");

    websocket.onopen = () => {
      websocket.send("hi");
      console.log("websocket ok");
    };

    websocket.onerror = () => {
      console.log("error websocket");
    };

    websocket.onmessage = (event) => {
      console.log("receive message thru websockets");
      console.log({ event });
    };
  }, []);

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen overflow-auto">
      <div className="text-white whitespace-pre">
        {JSON.stringify(conversation, null, 2)}
        {response && <p>{response}</p>}
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
