# Multi-threading with Piscina

This directory contains the worker implementation for handling LLM processing in separate threads using the Piscina library.

## Architecture

### Worker Pool (`../services/worker-pool.ts`)

- Manages a pool of worker threads using Piscina
- Automatically scales based on available CPU cores (max 8 threads)
- Handles job queuing and distribution
- Provides graceful shutdown capabilities

### LLM Worker (`llm-worker.ts`)

- Contains the actual LLM processing logic
- Runs in separate threads to avoid blocking the main event loop
- Handles all LLM model interactions (OpenAI, Anthropic, Gemini, DeepSeek)
- Manages streaming responses and Redis communication

## Benefits

1. **Non-blocking**: LLM processing doesn't block the main server thread
2. **Scalability**: Multiple concurrent LLM requests can be processed simultaneously
3. **Resource Management**: Automatic thread pool management with configurable limits
4. **Fault Tolerance**: Isolated worker processes prevent crashes from affecting the main server
5. **Performance**: Better CPU utilization for I/O intensive LLM operations

## Configuration

The worker pool is configured with the following settings:

- **Max Threads**: Minimum of 1, maximum of 4, or available CPU cores - 1
- **Min Threads**: 1 (always keep at least one thread ready)
- **Idle Timeout**: 30 seconds (threads are terminated after being idle)
- **Max Queue**: 100 tasks (additional requests are rejected when queue is full)

## Usage

The worker pool is automatically initialized when the server starts and is used by the chat route handlers. No manual configuration is required.

## Monitoring

Worker pool statistics are available via the `/health` endpoint:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "workerPool": {
    "threadCount": 4,
    "isInitialized": true
  }
}
```

## Graceful Shutdown

The application handles graceful shutdown by:

1. Stopping new requests
2. Waiting for active workers to complete
3. Shutting down the worker pool
4. Closing Redis connections
5. Terminating the process
