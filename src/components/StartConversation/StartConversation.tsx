"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowUp } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Doc } from "../../../convex/_generated/dataModel";

export const StartConversation = () => {
  const createInitialConversation = useMutation(
    api.conversations.createInitialConversation,
  ).withOptimisticUpdate((localStore, args) => {
    const { conversationId, content } = args;
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
        {
          conversation: dummyConversation,
          /* @ts-expect-error oks */
          messages: [{ role: "user", content }],
        },
      );
    }
  });

  const router = useRouter();
  const [body, setBody] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const onSendRequest = async () => {
    const generatedConversationId = uuidv4();
    const generatedResumableStreamId = uuidv4();

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
        resumableStreamId: generatedResumableStreamId,
        messages: [{ role: "user", content: body }],
      }),
    });
  };

  return (
    <div className="grid grid-rows-[1fr_100px] h-screen">
      <div
        className="overflow-auto"
        ref={messagesContainerRef}
        style={{ scrollBehavior: "auto" }}
      >
        <div className="text-white flex flex-col gap-2 mx-auto w-full max-w-3xl space-y-12 px-4 pb-10 pt-4 whitespace-pre-wrap break-words">
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
