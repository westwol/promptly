# Web App

## Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- API keys for AI providers (OpenAI, Anthropic, Google, Deepseek)
- Setup (clerk for nextjs)[https://clerk.com/docs/quickstarts/nextjs]

### Installation

1. Install dependencies from the root directory:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Rename `.env.local.example` to `.env.local` file in the root directory with your API keys:

   - CONVEX_DEPLOYMENT: You can grab this env after setting up convex
   - NEXT_PUBLIC_CONVEX_URL: You can grab this env after setting up convex
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: From the pre-requisites
   - CLERK_SECRET_KEY: From the pre-requisites
   - UPLOADTHING_TOKEN: (Sign up)[https://uploadthing.com/sign-in], create a project and paste the token

### Development

Start the development server:

```bash
npm run dev
```

The web app will be available at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
