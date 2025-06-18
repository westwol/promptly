import { useState } from 'react';
import { first } from 'lodash';

import { CHAT_STARTER_RECOMMENDATIONS } from './constants';
import { useChatStore } from '@t3chat/store/chat';
import { cn } from '@t3chat/lib/utils';

export const ChatRecommendations = () => {
  const setContent = useChatStore((state) => state.setContent);
  const [currentCategory, setCurrentCategory] = useState(() => first(CHAT_STARTER_RECOMMENDATIONS));

  return (
    <div className="overflow-auto scroll-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 space-y-12 px-4 pt-4 pb-10 break-words whitespace-pre-wrap text-white">
        <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
          <div className="animate-in fade-in-50 zoom-in-95 w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 sm:px-8">
            <h2 className="text-3xl font-semibold">How can I help you?</h2>
            <ul className="grid grid-cols-4">
              {CHAT_STARTER_RECOMMENDATIONS.map((category) => {
                const Icon = category.icon;
                const selected = currentCategory?.label === category.label;
                return (
                  <button
                    key={`conversation-starters-${category.label}`}
                    className={cn(
                      'bg-tertiary flex w-[100px] flex-col items-center justify-center gap-2 rounded-lg p-4 hover:opacity-80',
                      selected && 'bg-primary'
                    )}
                    onClick={() => setCurrentCategory(category)}
                  >
                    <Icon className="max-sm:block" />
                    <span className="text-sm font-bold">{category.label}</span>
                  </button>
                );
              })}
            </ul>
            <ul className="mt-10 grid grid-cols-2 gap-4">
              {currentCategory?.recommendations.map((recommendation) => (
                <li
                  key={`conversation-starter-${recommendation}`}
                  className="hover:bg-primary bg-tertiary rounded-lg p-4 text-sm font-normal shadow-sm"
                  onClick={() => setContent(recommendation)}
                >
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
