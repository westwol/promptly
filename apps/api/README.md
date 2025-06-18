# Chat API Documentation

A real-time llm chat API with streaming capabilites

## Pre-requisites

1. Run the redis instance in docker

```
docker compose up
```

## Setup

1. Rename .env.example to .env and fill in the required env variables.

CONVEX_URL: You can grab this convex url after setting up convex
ANTHROPIC_API_KEY: You can create an api key in (anthropic console)[https://console.anthropic.com/settings/keys]
DEEPSEEK_API_KEY You can create an api key in (deepseek platform)[https://platform.deepseek.com/api_keys]
GEMINI_API_KEY: You can create an api key in (google ai studio)[https://aistudio.google.com/app/apikey]
OPENAI_API_KEY: You can create an api key in (open ai platform)[https://platform.openai.com/api-keys]
UPLOADTHING_TOKEN: (Sign up)[https://uploadthing.com/sign-in], create a project and paste the token

2. Run the project

```
npm install
npm run dev
```

## Endpoints

### 1. Health Check

Check if the API is running and get worker pool stats.

```bash
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "workerPool": {
    "threadCount": 4,
    "activeWorkers": 2
  }
}
```

### 2. Start Chat

Initiate a new chat conversation.

```bash
POST /api/chat/start
```

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "conversationId": "conversation_123",
  "model": "gpt-3.5-turbo",
  "reasoning": false,
  "attachments": [],
  "customApiKey": "optional-openai-key"
}
```

**Response:**

```json
{
  "ok": true,
  "streamId": "stream_abc123"
}
```

### 3. Stream Chat

Get real-time chat responses via Server-Sent Events.

```bash
GET /api/chat/stream?streamId=stream_abc123
```

**Event Types:**

- `message`: Text chunks from the AI response
- `image`: Generated images (if applicable)
- `done`: Stream completion
- `error`: Error events
