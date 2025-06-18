import { ReactNode } from 'react';

import { LlmModelType } from '@t3chat/interfaces/llmModels';
import { AnthropicIcon, DeepseekIcon, GeminiIcon, OpenaiIcon } from '@t3chat/icons';

export const MODEL_ICON_MAP: Record<LlmModelType, ReactNode> = {
  gemini: <GeminiIcon />,
  openai: <OpenaiIcon />,
  anthropic: <AnthropicIcon />,
  deepseek: <DeepseekIcon />,
};
