# Promptly - Multi-Model AI Chat Platform

A modern, full-stack AI chat application built with Next.js, featuring support for multiple AI providers, image generation, real-time streaming, file uploads.

## 🚀 Features

### 🤖 Multi-Model AI Support

- **OpenAI**: GPT-3.5 Turbo, GPT-4, o4-mini, GPT Image Generation
- **Anthropic**: Claude 4 Sonnet with vision and reasoning capabilities
- **Google**: Gemini 2.5 Flash and Pro models with web search and document analysis
- **Deepseek**: R1 model with enhanced reasoning capabilities

### 💬 Chat Features

- **Real-time streaming** responses with live token updates
- **Conversation management** with titles, pinning, and deletion
- **Message history** with persistent storage
- **Markdown rendering** with syntax highlighting
- **Copy-to-clipboard** functionality for responses
- **Chat recommendations** with categorized starter prompts

### 🔐 Authentication & User Management

- **Clerk integration** for secure authentication
- **Google OAuth** sign-in support
- **Anonymous sessions** for guest users
- **User preferences** and API key management

### 📁 File & Media Support

- **Image uploads** for vision-enabled models
- **PDF document analysis** for supported models
- **Drag-and-drop** file uploads
- **Multiple file types** support (images, PDFs)

### ⚙️ Other features

- **Custom API keys** - Bring your own API keys for any provider
- **Model-specific capabilities** - Vision, web search, reasoning, image generation
- **Rate limiting** to prevent abuse

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ and npm 9+
- Redis (for development, provided via Docker)
- API keys for your preferred AI providers

## 🔧 Configuration

### App Documentation

- **[Web App Documentation](apps/web/README.md)** - Next.js frontend application
- **[API Server Documentation](apps/api/README.md)** - Fastify backend API server
- **[Convex Database Documentation](apps/convex/README.md)** - Database schema and functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
