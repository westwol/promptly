import { LlmModel } from '@t3chat/interfaces/llmModels';

export const AVAILABLE_MODELS: LlmModel[] = [
  {
    name: 'GPT-3.5 Turbo',
    model: 'gpt-3.5-turbo',
    type: 'openai',
    description: `OpenAI's fastest model`,
    capabilities: [],
  },
  {
    name: 'o4-mini',
    model: 'o4-mini',
    type: 'openai',
    description: `OpenAI's latest small reasoning model`,
    capabilities: ['vision', 'reasoning'],
  },
  {
    name: 'GPT ImageGen',
    model: 'gpt-image-1',
    type: 'openai',
    description: `Image generation v1`,
    capabilities: ['image_generation'],
  },
  {
    name: 'Gemini 2.5 Flash',
    model: 'gemini-2.0-flash',
    type: 'gemini',
    description: `Google's latest fast model`,
    capabilities: ['vision', 'web', 'document'],
  },
  {
    name: 'Gemini 2.5 Pro',
    model: 'gemini-1.5-pro',
    type: 'gemini',
    description: `Google's newest experimental model`,
    capabilities: ['vision', 'web', 'document'],
  },
  {
    name: 'Claude 4 Sonnet',
    model: 'claude-sonnet-4-20250514',
    type: 'anthropic',
    description: `Anthrophic's flagship model`,
    capabilities: ['vision', 'document', 'reasoning'],
  },
  {
    name: 'Deepseek R1 (Llama Distilled)',
    model: 'deepseek-chat',
    type: 'deepseek',
    description: `Deepseek R1, distilled on Llama 3.3 70b`,
    capabilities: ['reasoning'],
  },
];
