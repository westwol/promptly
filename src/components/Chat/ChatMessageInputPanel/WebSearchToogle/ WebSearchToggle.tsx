import clsx from 'clsx';
import { Globe } from 'lucide-react';

import { Tooltip } from '@t3chat/components/ui';
import { useChatStore } from '@t3chat/store/chat';

export const WebSearchToggle = () => {
  const webSearchEnabled = useChatStore((state) => state.webSearchEnabled);
  const setWebSearchEnabled = useChatStore((state) => state.setWebSearch);

  console.log('re-rendering websearch toogle');

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'hover:hover:bg-secondary/20 flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 p-1.5 text-xs text-white',
            webSearchEnabled && 'bg-primary'
          )}
          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
        >
          <Globe size={12} color={webSearchEnabled ? 'var(--color-sky-500)' : 'white'} />
          Search
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={10}>Enable search grounding</Tooltip.Content>
    </Tooltip.Root>
  );
};
