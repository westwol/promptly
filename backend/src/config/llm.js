import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const anthropic = new OpenAI({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const gemini = new OpenAI({
  baseURL: process.env.GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
});
