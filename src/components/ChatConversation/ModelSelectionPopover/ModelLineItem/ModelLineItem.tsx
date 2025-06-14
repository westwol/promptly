import {
  LucideEye,
  LucideFileText,
  LucideGlobe,
  LucideInfo,
} from "lucide-react";

import { LlmModelType } from "@t3chat/interfaces/llmModels";
import { ReactNode } from "react";
import {
  AnthropicIcon,
  DeepseekIcon,
  GeminiIcon,
  OpenaiIcon,
} from "@t3chat/icons";
import { Tooltip } from "@t3chat/components/ui";

const MODEL_ICON_MAP: Record<LlmModelType, ReactNode> = {
  gemini: <GeminiIcon />,
  openai: <OpenaiIcon />,
  anthropic: <AnthropicIcon />,
  deepseek: <DeepseekIcon />,
};

interface ModelLineItemsProps {
  name: string;
  type: LlmModelType;
  description?: string;
  onSelect: () => void;
}

export const ModelLineItem = ({
  name,
  type,
  description,
  onSelect,
}: ModelLineItemsProps) => {
  return (
    <div
      role="menuitem"
      className="relative cursor-default select-none rounded-sm text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group flex flex-col items-start gap-1 p-3 hover:bg-secondary/20 duration-100"
      data-orientation="vertical"
      data-radix-collection-item=""
      onClick={onSelect}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors">
          {MODEL_ICON_MAP[type]}
          <span className="w-fit">{name}</span>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <div>
                <LucideInfo
                  className="h-4 w-4"
                  color="var(--color-secondary)"
                />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{description}</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-[--color] dark:text-[--color-dark]"
            data-state="closed"
          >
            <div className="absolute inset-0 bg-current opacity-20 dark:opacity-15"></div>
            <LucideEye className="h-4 w-4" />
          </div>
          <div
            className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-[--color] dark:text-[--color-dark]"
            data-state="closed"
          >
            <div className="absolute inset-0 bg-current opacity-20 dark:opacity-15"></div>
            <LucideGlobe className="h-4 w-4" />
          </div>
          <div
            className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-[--color] dark:text-[--color-dark]"
            data-state="closed"
          >
            <div className="absolute inset-0 bg-current opacity-20 dark:opacity-15"></div>
            <LucideFileText className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
