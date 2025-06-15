'use client';

import { useRef } from 'react';
import { useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import { Code, GraduationCap, Newspaper, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSessionStore } from '@t3chat/store/session';
import { startChat } from '@t3chat/utils/api';
import { usePreferencesStore } from '@t3chat/store/preferences';

import { api } from '@t3chat-convex/_generated/api';
import { Doc } from '@t3chat-convex/_generated/dataModel';
import { ChatMessageInputPanel } from '../ChatMessageInputPanel';

export const StartConversation = () => {
  const sessionId = useSessionStore((state) => state.sessionId);

  const createInitialConversation = useMutation(
    api.conversations.createInitialConversation
  ).withOptimisticUpdate((localStore, args) => {
    const { conversationId, content } = args;
    const currentValue = localStore.getQuery(api.conversations.get, { sessionId });
    if (currentValue !== undefined) {
      const currentDate = new Date().toISOString();
      /* @ts-expect error aosdka */
      const dummyConversation = {
        _id: 'some-dummy-id',
        title: '',
        userId: sessionId,
        conversationUuid: conversationId,
        updatedAt: currentDate,
        createdAt: currentDate,
      } as Doc<'conversations'>;
      localStore.setQuery(api.conversations.get, { sessionId }, [
        dummyConversation,
        ...currentValue,
      ]);
      localStore.setQuery(
        api.conversations.getById,
        { conversationUuid: conversationId },
        {
          conversation: dummyConversation,
          /* @ts-expect-error oks */
          messages: [{ role: 'user', content }],
        }
      );
    }
  });

  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const onSendRequest = async (content: string) => {
    const preferencesStore = usePreferencesStore.getState();
    const generatedConversationId = uuidv4();

    router.push(`/conversations/${generatedConversationId}`);

    const conversationId = await createInitialConversation({
      conversationId: generatedConversationId,
      content,
      sessionId,
    });

    startChat({
      content,
      conversationId,
      model: preferencesStore.model.model,
    });
  };

  return (
    <div className="grid h-screen grid-rows-[1fr_100px]">
      <div className="overflow-auto" ref={messagesContainerRef} style={{ scrollBehavior: 'auto' }}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white">
          <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
            <div className="animate-in fade-in-50 zoom-in-95 w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 sm:px-8">
              <h2 className="text-3xl font-semibold">How can I help you?</h2>
              <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
                <button
                  className="focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border-reflect button-reflect text-primary-foreground dark:bg-primary/20 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 outline-secondary/70 data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:hover:bg-secondary flex h-9 items-center justify-center gap-1 rounded-xl bg-[rgb(162,59,103)] p-2 px-5 py-2 text-sm font-semibold whitespace-nowrap shadow outline-1 backdrop-blur-xl transition-colors hover:bg-[#d56698] focus-visible:ring-1 focus-visible:outline-none active:bg-[rgb(162,59,103)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] data-[selected=false]:outline max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40"
                  data-selected="true"
                >
                  <Sparkles className="max-sm:block" />
                  <div>Create</div>
                </button>
                <button
                  className="focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground disabled:hover:bg-primary outline-secondary/70 data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:hover:bg-secondary flex h-9 items-center justify-center gap-1 rounded-xl px-5 py-2 text-sm font-semibold whitespace-nowrap shadow outline-1 backdrop-blur-xl transition-colors hover:bg-pink-600/90 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[selected=false]:outline max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <Newspaper className="max-sm:block" />
                  <div>Explore</div>
                </button>
                <button
                  className="focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground disabled:hover:bg-primary outline-secondary/70 data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:hover:bg-secondary flex h-9 items-center justify-center gap-1 rounded-xl px-5 py-2 text-sm font-semibold whitespace-nowrap shadow outline-1 backdrop-blur-xl transition-colors hover:bg-pink-600/90 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[selected=false]:outline max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <Code className="max-sm:block" />
                  <div>Code</div>
                </button>
                <button
                  className="focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground disabled:hover:bg-primary outline-secondary/70 data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:hover:bg-secondary flex h-9 items-center justify-center gap-1 rounded-xl px-5 py-2 text-sm font-semibold whitespace-nowrap shadow outline-1 backdrop-blur-xl transition-colors hover:bg-pink-600/90 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[selected=false]:outline max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                  data-selected="false"
                >
                  <GraduationCap className="max-sm:block" />
                  <div>Learn</div>
                </button>
              </div>
              <div className="text-foreground flex flex-col">
                <div className="border-secondary/20 flex items-start gap-2 border-t py-1 first:border-none">
                  <button className="text-secondary-foreground hover:bg-secondary/50 w-full rounded-md py-2 text-left sm:px-3">
                    <span>Write a short story about a robot discovering emotions</span>
                  </button>
                </div>
                <div className="border-secondary/20 flex items-start gap-2 border-t py-1 first:border-none">
                  <button className="text-secondary-foreground hover:bg-secondary/50 w-full rounded-md py-2 text-left sm:px-3">
                    <span>Help me outline a sci-fi novel set in a post-apocalyptic world</span>
                  </button>
                </div>
                <div className="border-secondary/20 flex items-start gap-2 border-t py-1 first:border-none">
                  <button className="text-secondary-foreground hover:bg-secondary/50 w-full rounded-md py-2 text-left sm:px-3">
                    <span>
                      Create a character profile for a complex villain with sympathetic motives
                    </span>
                  </button>
                </div>
                <div className="border-secondary/20 flex items-start gap-2 border-t py-1 first:border-none">
                  <button className="text-secondary-foreground hover:bg-secondary/50 w-full rounded-md py-2 text-left sm:px-3">
                    <span>Give me 5 creative writing prompts for flash fiction</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatMessageInputPanel onSendChatRequest={onSendRequest} />
    </div>
  );
};
