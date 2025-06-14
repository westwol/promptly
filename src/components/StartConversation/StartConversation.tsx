"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "../../../convex/_generated/api";
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
          <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
            <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
              <h2 className="text-3xl font-semibold">How can I help you?</h2>
              <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
                <button
                  className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border-reflect button-reflect bg-[rgb(162,59,103)] p-2 text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-sparkles max-sm:block"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                    <path d="M20 3v4"></path>
                    <path d="M22 5h-4"></path>
                    <path d="M4 17v2"></path>
                    <path d="M5 18H3"></path>
                  </svg>
                  <div>Create</div>
                </button>
                <button
                  className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-newspaper max-sm:block"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                    <path d="M18 14h-8"></path>
                    <path d="M15 18h-5"></path>
                    <path d="M10 6h8v4h-8V6Z"></path>
                  </svg>
                  <div>Explore</div>
                </button>
                <button
                  className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-code max-sm:block"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <div>Code</div>
                </button>
                <button
                  className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-graduation-cap max-sm:block"
                  >
                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                    <path d="M22 10v6"></path>
                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                  </svg>
                  <div>Learn</div>
                </button>
              </div>
              <div className="flex flex-col text-foreground">
                <div className="flex items-start gap-2 border-t border-secondary/20 py-1 first:border-none">
                  <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                    <span>
                      Write a short story about a robot discovering emotions
                    </span>
                  </button>
                </div>
                <div className="flex items-start gap-2 border-t border-secondary/20 py-1 first:border-none">
                  <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                    <span>
                      Help me outline a sci-fi novel set in a post-apocalyptic
                      world
                    </span>
                  </button>
                </div>
                <div className="flex items-start gap-2 border-t border-secondary/20 py-1 first:border-none">
                  <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                    <span>
                      Create a character profile for a complex villain with
                      sympathetic motives
                    </span>
                  </button>
                </div>
                <div className="flex items-start gap-2 border-t border-secondary/20 py-1 first:border-none">
                  <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                    <span>
                      Give me 5 creative writing prompts for flash fiction
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
