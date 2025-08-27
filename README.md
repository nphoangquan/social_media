## Overview

This is my final-year project - Social Media Platform.

## Key Features

### Core Social Features
- **Real-time Messaging** - Instant chat with Socket.io integration
- **Stories & Posts** - Share moments with 24-hour expiring stories and permanent posts
- **Friend Management** - Send and manage friend requests, build your network
- **Advanced Search** - Find users and content with intelligent search algorithms
- **Activity Feed** - Stay updated with personalized content feeds
- **User Profiles** - Customizable profiles with media galleries
- **Privacy Controls** - Block users and manage privacy settings

### Interactive Features
- **Comments & Reactions** - Nested comment threads with like and reaction systems
- **Media Support** - Upload and share images, videos, and multimedia content
- **Birthday Celebrations** - Automatic birthday reminders and celebrations
- **Follow System** - Follow users and curate your social experience
- **Real-time Notifications** - Instant updates for all interactions

### AI-Powered Features
- **Smart Captions** - AI-generated captions for uploaded images
- **Content Summarization** - AI-powered content summarization
- **Multi-language Translation** - Real-time translation support
- **AI Assistant** - Integrated chatbot for user assistance

## Technology Stack

### Frontend
- **React 19** - Modern JavaScript UI library
- **Next.js 15.2.4** - Full-stack React framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Clean, consistent icons

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6.5.0** - Modern database ORM
- **PostgreSQL** - Robust relational database
- **Socket.io** - Real-time communication

### Authentication & Media
- **Clerk 6.13.0** - Modern authentication and user management
- **Cloudinary** - Cloud-based media management
- **Zod** - Runtime type validation

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - Advanced CSS processing
- **Turbopack** - High-performance bundler

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation
1. **Install dependencies**
```bash
npm install
```

1. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/introvertia"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLERK_SECRET_KEY="sk_your_clerk_secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_your_clerk_publishable_key"
```

1. **Set up the database**
```bash
npx prisma migrate dev
npx prisma generate
```

1. **Start the development server**
```bash
npm run dev
```

## Deployment

### Recommended Platform
- **Vercel** - Optimized for Next.js applications
- **Neon** - Serverless PostgreSQL database
- **Cloudinary** - Media storage and optimization
