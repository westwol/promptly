export type LlmModelType = "gemini" | "openai" | "anthropic" | "deepseek";

export interface LlmModel {
  name: string;
  model: string;
  type: LlmModelType;
  description: string;
}
