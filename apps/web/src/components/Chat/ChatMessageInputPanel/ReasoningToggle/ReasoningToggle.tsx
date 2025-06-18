import clsx from 'clsx';
import { Lightbulb } from 'lucide-react';

import { Tooltip } from '@t3chat/components/ui';
import { useChatStore } from '@t3chat/store/chat';
import { cn } from '@t3chat/lib/utils';

export const ReasoningToggle = () => {
  const reasoningEnabled = useChatStore((state) => state.reasoningEnabled);
  const setReasoningEnabled = useChatStore((state) => state.setReasoning);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'hover:hover:bg-secondary/20 flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 p-1.5 text-xs text-white',
            reasoningEnabled && 'bg-primary'
          )}
          onClick={() => setReasoningEnabled(!reasoningEnabled)}
        >
          <Lightbulb size={12} className={cn(reasoningEnabled ? 'text-amber-400' : 'text-white')} />
          Reasoning
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={10}>Enable reasoning effort</Tooltip.Content>
    </Tooltip.Root>
  );
};
