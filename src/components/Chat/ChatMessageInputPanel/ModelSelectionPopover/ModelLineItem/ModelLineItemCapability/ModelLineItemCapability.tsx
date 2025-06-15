import { ReactNode } from 'react';
import { Brain, LucideEye, LucideFileText, LucideGlobe } from 'lucide-react';

import { Tooltip } from '@t3chat/components/ui';

const CAPABILITY_ICON_MAP: Record<string, ReactNode> = {
  vision: <LucideEye className="h-4 w-4" />,
  web: <LucideGlobe className="h-4 w-4" />,
  document: <LucideFileText className="h-4 w-4" />,
  reasoning: <Brain className="h-4 w-4" />,
};

const CAPABILITY_DESCRIPTIONS: Record<string, string> = {
  vision: 'Support image uploads and analysis',
  web: 'Uses search to answer the question',
  document: 'Supports PDF uploads and analysis',
  reasoning: 'Enhanced reasoning capabilities',
};

const CAPABILITY_STYLES: Record<string, { bg: string; text: string }> = {
  vision: { bg: 'var(--color-emerald-500)', text: 'var(--color-emerald-500)' },
  web: { bg: 'var(--color-sky-500)', text: 'var(--color-sky-500)' },
  document: { bg: 'var(--color-purple-500)', text: 'var(--color-purple-500)' },
  reasoning: { bg: 'var(--color-fuchsia-500)', text: 'var(--color-fuchsia-500)' },
};

interface ModelLineItemCapabilityProps {
  capability: string;
}

export const ModelLineItemCapability = ({ capability }: ModelLineItemCapabilityProps) => (
  <li
    className={`bg-blue relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md ${CAPABILITY_STYLES[capability].text}`}
    style={{ color: CAPABILITY_STYLES[capability].text }}
    data-state="closed"
  >
    <Tooltip.Root>
      <Tooltip.Trigger>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: CAPABILITY_STYLES[capability].bg }}
        ></div>
        {CAPABILITY_ICON_MAP[capability]}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{CAPABILITY_DESCRIPTIONS[capability]}</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </li>
);
