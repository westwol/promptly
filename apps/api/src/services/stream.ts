import { Id } from '@convex/_generated/dataModel';

import { workerPool } from './worker-pool';

interface Message {
  role: string;
  content: string;
}

export interface Attachment {
  mimeType: string;
  name: string;
  url: string;
}

interface ChatEvent {
  id?: number;
  type?: 'INIT' | 'DONE' | 'MESSAGE' | 'REASONING' | 'IMAGE';
  text?: string;
  imageUrl?: string;
}

interface StartLlmJobParams {
  conversationId: Id<'conversations'>;
  messages: Message[];
  model: string;
  attachments?: Attachment[];
  reasoning: boolean;
  customApiKey?: string;
}

const IMAGE_GENERATION_MODELS = ['gpt-image-1'];

export async function startLLMJob({
  conversationId,
  messages,
  model,
  attachments,
  reasoning,
  customApiKey,
}: StartLlmJobParams) {
  try {
    // Use the worker pool to process the LLM job
    const result = await workerPool.processLLMJob({
      conversationId,
      messages,
      model,
      attachments,
      reasoning,
      customApiKey,
    });

    if (!result.success) {
      console.error('LLM job failed:', result.error);
      // Handle error case - the worker already handles error messages
    }

    return result;
  } catch (error) {
    console.error('Error starting LLM job:', error);
    throw error;
  }
}
