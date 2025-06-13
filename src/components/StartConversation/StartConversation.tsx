"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Doc } from "../../../convex/_generated/dataModel";
import { ThinkingIndicator } from "../ChatConversation/ThinkingIndicator";
import { ChatMessage } from "../ChatConversation/ChatMessage/ChatMessage";

export const StartConversation = () => {
  const [isInitialMessageSent, setIsInitialMessageSent] =
    useState<boolean>(false);

  const createInitialConversation = useMutation(
    api.conversations.createInitialConversation,
  ).withOptimisticUpdate((localStore, args) => {
    const { conversationId } = args;
    const currentValue = localStore.getQuery(api.conversations.get);
    if (currentValue !== undefined) {
      const currentDate = new Date().toISOString();
      /* @ts-expect error aosdka */
      const dummyConversation = {
        _id: "some-dummy-id",
        userId: "jh7abgx9czyf0es24jgnbyxgmd7hjwsr",
        title: "",
        conversationUuid: conversationId,
        updatedAt: currentDate,
        createdAt: currentDate,
      } as Doc<"conversations">;
      localStore.setQuery(api.conversations.get, {}, [
        dummyConversation,
        ...currentValue,
      ]);
      localStore.setQuery(
        api.conversations.getById,
        { conversationUuid: conversationId },
        { conversation: dummyConversation, messages: [] },
      );
    }
  });

  const router = useRouter();
  const [body, setBody] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const onSendRequest = async () => {
    const generatedConversationId = uuidv4();

    setIsInitialMessageSent(true);
    router.push(`/conversations/${generatedConversationId}`);

    const conversationId = await createInitialConversation({
      conversationId: generatedConversationId,
      content: body,
    });

    fetch("http://localhost:4000/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messages: [{ role: "user", content: body }],
      }),
    });
  };

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
        {isInitialMessageSent ? (
          <>
            <div className="ml-auto bg-gray-800 rounded-md p-3">
              <strong>You:</strong>
              <ChatMessage content={body} />
            </div>
            <ThinkingIndicator />
          </>
        ) : (
          <ul>
            <li onClick={() => setBody("How far is the universe?")}>
              How far is the universe?
            </li>
            <li onClick={() => setBody("How many bones a human has?")}>
              How many bones a human has?
            </li>
            <li
              onClick={() =>
                setBody("Give me a sample hello world endpoint in rust")
              }
            >
              Give me a sample hello world endpoint in rust
            </li>
          </ul>
        )}
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
