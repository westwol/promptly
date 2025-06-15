import { Tooltip } from '@t3chat/components/ui';
import clsx from 'clsx';
import { Globe } from 'lucide-react';

interface WebSearchToggleProps {
  webSearchEnabled: boolean;
  onChangeWebSearch: (enabled: boolean) => void;
}

export const WebSearchToggle = ({ webSearchEnabled, onChangeWebSearch }: WebSearchToggleProps) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 p-1.5 text-xs text-white',
            webSearchEnabled && 'bg-primary'
          )}
          onClick={() => onChangeWebSearch(!webSearchEnabled)}
        >
          <Globe size={12} color={webSearchEnabled ? 'var(--color-sky-500)' : 'white'} />
          Search
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={10}>Enable search grounding</Tooltip.Content>
    </Tooltip.Root>
  );
};
