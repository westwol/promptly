import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
};

const deepseekConfig = {
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
};

const anthropicConfig = {
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
};

const geminiConfig = {
  baseURL: process.env.GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
};

export const openai = new OpenAI(openaiConfig);
export const deepseek = new OpenAI(deepseekConfig);
export const anthropic = new OpenAI(anthropicConfig);
export const gemini = new OpenAI(geminiConfig);

const getModelLlmBaseUrl = (model: string) => {
  switch (model) {
    case 'gpt-3.5-turbo':
    case 'gpt-4':
    case 'o4-mini':
    case 'gpt-image-1':
      return undefined;
    case 'gemini-2.0-flash':
    case 'gemini-1.5-pro':
      return geminiConfig.baseURL;
    case 'claude-sonnet-4-20250514':
    case 'claude-3-opus-20240229':
    case 'claude-3-sonnet-20240229':
      return anthropicConfig.baseURL;
    case 'deepseek-chat':
    case 'deepseek-coder':
      return deepseek.apiKey;
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
};

export const createCustomLlmClient = (customApiKey: string, model: string) => {
  return new OpenAI({
    apiKey: customApiKey,
    baseURL: getModelLlmBaseUrl(model),
  });
};
