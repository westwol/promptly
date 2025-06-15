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
