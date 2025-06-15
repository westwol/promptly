import Fastify from 'fastify';
import cors from '@fastify/cors';
import OpenAI from 'openai';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import multipart from '@fastify/multipart';

dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });
await fastify.register(multipart);

const client = new ConvexHttpClient(process.env.CONVEX_URL);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const anthropic = new OpenAI({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new OpenAI({
  baseURL: process.env.GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
});

const VISION_MODELS = [
  'gpt-4-vision-preview',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
];

async function generateConversationTitle(conversationId, content) {
  const titleCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Generate a short, concise title (max 5 words) for based on the following content. Return only the title text, nothing else: ${content}`,
      },
    ],
    max_tokens: 20,
  });

  const title = titleCompletion.choices[0].message.content.trim() || 'New conversation';

  await client.mutation('conversations:updateConversation', {
    conversationId,
    title,
  });
}

async function processImage(file) {
  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString('base64');
}

async function startLLMJob(
  streamId,
  conversationId,
  messages,
  model = 'gpt-3.5-turbo',
  imageData = null
) {
  let messageId;

  try {
    // Initialize stream
    await redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'INIT' }));

    messageId = await client.mutation('conversations:addNewMessageToConversation', {
      conversationId,
      resumableStreamId: streamId,
      role: 'assistant',
      status: 'streaming',
      content: '',
    });

    const shouldGenerateTitle = messages.length === 1;
    if (shouldGenerateTitle) {
      generateConversationTitle(conversationId, messages[0].content).catch((err) =>
        console.error('Title generation failed:', err)
      );
    }

    let completion;

    const completionParams = {
      model,
      messages: imageData
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', text: messages[messages.length - 1].content },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
              ],
            },
            ...messages,
          ]
        : messages,
      stream: true,
    };

    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
      case 'o4-mini':
      case 'gpt-4-vision-preview':
        completion = await openai.chat.completions.create(completionParams);
        break;
      case 'gemini-2.0-flash':
      case 'gemini-1.5-pro':
        completion = await gemini.chat.completions.create(completionParams);
        break;
      case 'claude-sonnet-4-20250514':
      case 'claude-3-opus-20240229':
      case 'claude-3-sonnet-20240229':
        completion = await anthropic.chat.completions.create(completionParams);
        break;
      case 'deepseek-chat':
      case 'deepseek-coder':
        completion = await deepseek.chat.completions.create(completionParams);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    let idx = 0;
    let fullContent = '';

    for await (const chunk of completion) {
      let text;

      text = chunk.choices?.[0]?.delta?.content;

      if (!text) continue;

      fullContent += text;
      const event = { id: idx++, text };

      // Send events immediately without batching
      await Promise.all([
        redis.lpush(`chat:${streamId}`, JSON.stringify(event)),
        redis.publish(`chat:pub:${streamId}`, JSON.stringify(event)),
      ]);
    }

    // Mark completion
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
    ]);

    // Update message in Convex
    await client.mutation('conversations:completeMessage', {
      messageId,
      content: fullContent,
    });

    // Set TTL for cleanup
    await redis.expire(`chat:${streamId}`, 3600);
  } catch (error) {
    console.error('Stream processing error:', error);
    // Ensure we mark the stream as done even on error
    await Promise.all([
      redis.lpush(`chat:${streamId}`, JSON.stringify({ type: 'DONE' })),
      redis.publish(`chat:pub:${streamId}`, JSON.stringify({ type: 'DONE' })),
      client.mutation('conversations:completeMessage', {
        messageId,
        content: 'Error processing this request please retry',
      }),
    ]);
    throw error;
  }
}

fastify.post('/api/chat/start', async (request, reply) => {
  try {
    const data = await request.file();
    let messages,
      conversationId,
      resumableStreamId,
      model = 'gpt-3.5-turbo',
      imageData = null;

    if (data) {
      // Handle multipart form data
      const fields = {};
      for (const [key, value] of Object.entries(data.fields)) {
        fields[key] = value.value;
      }

      messages = JSON.parse(fields.messages);
      conversationId = fields.conversationId;
      resumableStreamId = fields.resumableStreamId;
      model = fields.model || 'gpt-3.5-turbo';

      if (data.filename) {
        imageData = await processImage(data.file);
      }
    } else {
      // Handle regular JSON data
      const body = request.body;
      messages = body.messages;
      conversationId = body.conversationId;
      resumableStreamId = body.resumableStreamId;
      model = body.model || 'gpt-3.5-turbo';
    }

    startLLMJob(resumableStreamId, conversationId, messages, model, imageData).catch((err) =>
      console.error(err)
    );
    return reply.send({ ok: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/api/chat/stream', async (request, reply) => {
  const streamId = request.query.streamId;
  if (!streamId) {
    return reply.status(400).send('Missing streamId');
  }

  const res = reply.raw;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.flushHeaders();

  let isClientConnected = true;

  try {
    // Get existing events
    const rawList = await redis.lrange(`chat:${streamId}`, 0, -1);
    const events = rawList.map(JSON.parse).reverse();

    // Send existing events
    for (const evt of events) {
      if (!isClientConnected) break;

      if (evt.type === 'INIT') continue;
      if (evt.type === 'DONE') {
        res.write(`event: done\ndata: \n\n`);
        continue;
      }
      res.write(`id: ${evt.id}\nevent: message\ndata: ${evt.text.replace(/\n/g, '\\n')}\n\n`);
    }

    // Subscribe for new events
    const sub = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    });

    await sub.subscribe(`chat:pub:${streamId}`);

    sub.on('message', (_chan, message) => {
      if (!isClientConnected) return;

      try {
        const evt = JSON.parse(message);
        if (evt.type === 'DONE') {
          res.write(`event: done\ndata: \n\n`);
        } else {
          res.write(`id: ${evt.id}\nevent: message\ndata: ${evt.text.replace(/\n/g, '\\n')}\n\n`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Cleanup on client disconnect
    request.raw.on('close', () => {
      isClientConnected = false;
      sub.disconnect();
      res.end();
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    if (isClientConnected) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Internal server error' })}\n\n`);
      res.end();
    }
  }
});

await fastify.listen({ port: 4000 });
