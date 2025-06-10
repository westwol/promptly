"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";

export const ChatConversation = () => {
  const tasks = useQuery(api.conversations.get);

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
      <div>convo here</div>
      <div className="relative">
        <textarea
          className="bg-primary w-full h-full text-white outline-0"
          placeholder="type something here"
        />
        <button className="absolute bottom-5 right-5 z-10 bg-blue-500 p-2">
          Send
        </button>
      </div>
    </div>
  );
};
