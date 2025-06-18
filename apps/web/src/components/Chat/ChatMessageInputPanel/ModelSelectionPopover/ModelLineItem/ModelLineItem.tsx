import { LucideInfo } from 'lucide-react';

import { LlmModel } from '@t3chat/interfaces/llmModels';
import { Tooltip } from '@t3chat/components/ui';

import { ModelLineItemCapability } from './ModelLineItemCapability';
import { MODEL_ICON_MAP } from '../shared/constants';
import { cn } from '@t3chat/lib/utils';

interface ModelLineItemsProps extends LlmModel {
  disabled: boolean;
  onSelect: () => void;
}

export const ModelLineItem = ({
  name,
  type,
  description,
  capabilities,
  disabled,
  onSelect,
}: ModelLineItemsProps) => (
  <div
    role="menuitem"
    className={cn(
      '[&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group hover:bg-tertiary relative flex cursor-default flex-col items-start gap-1 rounded-sm p-3 text-sm transition-colors duration-100 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      disabled && 'pointer-events-none opacity-50'
    )}
    onClick={disabled ? undefined : onSelect}
  >
    <div className="flex w-full items-center justify-between">
      <div className="text-muted-foreground flex items-center gap-2 pr-2 font-medium transition-colors">
        {MODEL_ICON_MAP[type]}
        <span className="w-fit">{name}</span>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div>
              <LucideInfo className="h-4 w-4 text-gray-400" />
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>{description}</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
      <ul className="flex items-center gap-2">
        {capabilities.map((capability) => (
          <ModelLineItemCapability key={capability} capability={capability} />
        ))}
      </ul>
    </div>
  </div>
);
