# Convex Backend

This is the Convex backend for the chat application, providing real-time database functionality and serverless functions for managing conversations and messages.

## Overview

The Convex backend handles:

- Real-time conversation management
- Message streaming and persistence
- User authentication integration
- Database schema and queries
- Serverless function execution

## Setup

### Prerequisites

- Node.js >= 20.x
- Convex account and project
- Environment variables configured

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in convex dashboard:

   ```bash
   NEXT_PUBLIC_CLERK_FRONTEND_API_URL=your_clerk_frontend_api_url
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Code Generation

Run `npm run codegen` to generate TypeScript types from your schema. This creates type-safe client functions in the `_generated` directory.

### Deployment

Deploy to your Convex development environment:

```bash
npm run deploy
```
