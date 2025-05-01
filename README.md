# Introvertia - Social Network - ĐỒ ÁN CƠ SỞ

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Next.js Version](https://img.shields.io/badge/Next.js-15.2.4-000000?logo=next.js)
![Prisma Version](https://img.shields.io/badge/Prisma-6.5.0-2D3748?logo=prisma)

<!-- ![Introvertia Banner](https://placeholder.co/1920x400.png?text=Introvertia+Social+Media+%E2%80%93+Connect+Deeply+%F0%9F%8C%8D) -->

A social media platform made by Nguyen Phan Hoang Quan

## 📑 Table of Contents
- [Introvertia - Social Network - ĐỒ ÁN CƠ SỞ](#introvertia---social-network---đồ-án-cơ-sở)
  - [📑 Table of Contents](#-table-of-contents)
  - [✨ Key Features](#-key-features)
  - [🛠 Tech Stack](#-tech-stack)
    - [🎨 Frontend](#-frontend)
    - [⚙️ Backend](#️-backend)
    - [🔧 Development Tools](#-development-tools)
    - [🗄 Database](#-database)
  - [📥 Installation](#-installation)
  - [⚙️ Configuration](#️-configuration)
  - [🚀 Deployment](#-deployment)

## ✨ Key Features
- 💬 Real-time chat with Socket.io (under development - Toi Sap Khoc Roi Cuu Voi)
- 📸 Cloudinary image uploads
- 🔐 Two-factor authentication with Clerk
- 🎨 Minimalist UI with TailwindCSS
- 📱 Responsive Design
- 🔄 Real-time Notifications
- 📚 Stories feature with expiration (24h expiration)
- 👥 Friend requests and friend management
- 🔍 Advanced search functionality for people and posts
- 🎂 Birthday celebrations and reminders (events)
- 📝 Post creation with text, images, and videos
- 🔔 Activity feed to track interactions
- 👤 Customizable user profiles
- 🛡️ User blocking

## 🛠 Tech Stack

### 🎨 Frontend
- **React 19** - JavaScript UI library
- **Next.js 15.2.4** - React framework for SSR and routing
- **TypeScript** - Type-safe programming language
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Next Cloudinary** - Cloudinary media integration

### ⚙️ Backend
- **Next.js API Routes** - API endpoints handler
- **Prisma 6.5.0** - Database ORM
- **Clerk 6.13.0** - Authentication & User Management
- **Zod** - Schema validation
- **Svix** - Webhook infrastructure

### 🔧 Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - High-speed bundler

### 🗄 Database
- **PostgreSQL** - Relational database system
- **Prisma ORM** - Type-safe database queries

## 📥 Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/introvertia-social-media.git
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

## ⚙️ Configuration

Create a `.env` file following this template:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRECT=""
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
```

## 🚀 Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Recommended Services:**
- Vercel for frontend/backend
- Railway for PostgreSQL
- Cloudinary for media storage

<!-- ## 🤝 Contributing
1. Fork the repository
2. Create new branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request -->

---

[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-000000?logo=vercel)](https://vercel.com)
[![Database by Railway](https://img.shields.io/badge/Database%20by-Railway-0B0D0E?logo=railway)](https://railway.app)

**Contact**: hq16101971@gmail.com |
