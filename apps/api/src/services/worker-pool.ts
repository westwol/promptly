import { join } from 'path';
import { Id } from '@convex/_generated/dataModel';

const Piscina = require('piscina');

import { Attachment } from './stream';

interface Message {
  role: string;
  content: string;
}

interface LLMJobData {
  conversationId: Id<'conversations'>;
  messages: Message[];
  model: string;
  attachments?: Attachment[];
  reasoning: boolean;
  customApiKey?: string;
}

interface LLMJobResult {
  success: boolean;
  streamId?: string;
  error?: string;
}

class WorkerPool {
  private pool: any;
  private isInitialized = false;

  constructor() {
    // Create a Piscina pool with the LLM worker
    this.pool = new Piscina({
      filename: join(__dirname, '../../dist/api/src/workers/llm-worker.js'),
      maxThreads: Math.max(1, Math.min(require('os').cpus().length - 1, 8)),
      minThreads: 2,
      idleTimeout: 30000, // 30 seconds
      maxQueue: 100, // Maximum number of queued tasks
    });

    this.isInitialized = true;
  }

  async processLLMJob(data: LLMJobData): Promise<LLMJobResult> {
    if (!this.isInitialized) {
      throw new Error('Worker pool not initialized');
    }

    try {
      const result = await this.pool.run(data);
      return result as LLMJobResult;
    } catch (error) {
      console.error('Worker pool error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown worker error',
      };
    }
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      await this.pool.destroy();
      this.isInitialized = false;
    }
  }

  getStats() {
    return {
      threadCount: this.pool.threads.length,
      isInitialized: this.isInitialized,
    };
  }
}

// Create a singleton instance
const workerPool = new WorkerPool();

export { workerPool };
export type { LLMJobData, LLMJobResult };
