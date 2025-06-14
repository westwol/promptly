import { LlmModel } from "@t3chat/interfaces/llmModels";

export const AVAILABLE_MODELS: LlmModel[] = [
  {
    name: "Gemini 2.5 Flash",
    model: "gemini-2.0-flash",
    type: "gemini",
    description: `Google's latest fast model`,
  },
  {
    name: "Gemini 2.5 Pro",
    model: "gemini-1.5-pro",
    type: "gemini",
    description: `Google's newest experimental model`,
  },
  {
    name: "GPT-3.5 Turbo",
    model: "gpt-3.5-turbo",
    type: "openai",
    description: `OpenAI's fastest model`,
  },
  {
    name: "o4-mini",
    model: "o4-mini",
    type: "openai",
    description: `OpenAI's latest small reasoning model`,
  },
  {
    name: "Claude 4 Sonnet",
    model: "claude-sonnet-4-20250514",
    type: "anthropic",
    description: `Anthrophic's flagship model`,
  },
  {
    name: "Claude 4 Sonnet (Reasoning)",
    model: "claude-sonnet-4-20250514_",
    type: "anthropic",
    description: `Anthrophic's flagship model`,
  },
  {
    name: "Deepseek R1 (Llama Distilled)",
    model: "deepseek-chat",
    type: "deepseek",
    description: `Deepseek R1, distilled on Llama 3.3 70b`,
  },
];
