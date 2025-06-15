import { useState } from 'react';
import { first } from 'lodash';

import { CHAT_STARTER_RECOMMENDATIONS } from './constants';
import { useChatStore } from '@t3chat/store/chat';

export const ChatRecommendations = () => {
  const setContent = useChatStore((state) => state.setContent);
  const [currentCategory, setCurrentCategory] = useState(() => first(CHAT_STARTER_RECOMMENDATIONS));

  return (
    <div className="overflow-auto scroll-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white">
        <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
          <div className="animate-in fade-in-50 zoom-in-95 w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 sm:px-8">
            <h2 className="text-3xl font-semibold">How can I help you?</h2>
            <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
              {CHAT_STARTER_RECOMMENDATIONS.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={`conversation-starters-${category.label}`}
                    className="focus-visible:ring-ring [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border-reflect button-reflect text-primary-foreground dark:bg-primary/20 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 outline-secondary/70 data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:hover:bg-secondary flex h-9 items-center justify-center gap-1 rounded-xl bg-[rgb(162,59,103)] p-2 px-5 py-2 text-sm font-semibold whitespace-nowrap shadow outline-1 backdrop-blur-xl transition-colors hover:bg-[#d56698] focus-visible:ring-1 focus-visible:outline-none active:bg-[rgb(162,59,103)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] data-[selected=false]:outline max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40"
                    onClick={() => setCurrentCategory(category)}
                  >
                    <Icon className="max-sm:block" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-foreground flex flex-col">
              {currentCategory?.recommendations.map((recommendation) => (
                <div
                  key={`conversation-starter-${recommendation}`}
                  className="border-secondary/20 flex items-start gap-2 border-t py-1 first:border-none"
                >
                  <button
                    className="text-secondary-foreground hover:bg-secondary/50 w-full rounded-md py-2 text-left sm:px-3"
                    onClick={() => setContent(recommendation)}
                  >
                    <span>{recommendation}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
