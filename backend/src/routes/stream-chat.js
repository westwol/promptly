import Redis from 'ioredis';

import { redis } from '../config/redis.js';

export async function streamChatHandler(request, reply) {
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
}
