# Introvertia - Social Network - ĐỒ ÁN CƠ SỞ

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Next.js Version](https://img.shields.io/badge/Next.js-15.2.4-000000?logo=next.js)
![Prisma Version](https://img.shields.io/badge/Prisma-6.5.0-2D3748?logo=prisma)

A social media platform made by Nguyễn Phan Hoàng Quân

Một trang mạng xã hội được thực hiện bởi Nguyễn Phan Hoàng Quân

## Table of Contents - Nội Dung
- [Introvertia - Social Network - ĐỒ ÁN CƠ SỞ](#introvertia---social-network---đồ-án-cơ-sở)
  - [Table of Contents - Nội Dung](#table-of-contents---nội-dung)
  - [Key Features - Tính Năng Chính](#key-features---tính-năng-chính)
  - [Tech Stack - Công Nghệ Sử Dụng](#tech-stack---công-nghệ-sử-dụng)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Development Tools](#development-tools)
    - [Database](#database)
  - [Installation - Cài Đặt](#installation---cài-đặt)
  - [Configuration - Cấu Hình](#configuration---cấu-hình)
  - [Deployment](#deployment)

## Key Features - Tính Năng Chính
- Real-time chat with Socket.io | Trò chuyện trực tuyến
- Cloudinary image uploads | Tải lên hình ảnh với Cloudinary
- Two-factor authentication with Clerk | Xác thực hai yếu tố với Clerk
- UI with TailwindCSS | Giao diện với TailwindCSS
- Responsive Design | Thiết kế thích ứng đa thiết bị
- Real-time Notifications | Thông báo theo thời gian thực
- Stories feature with expiration (24h expiration) | Tính năng Stories
- Friend requests and friend management | Quản lý bạn bè
- Advanced search functionality for people and posts | Tìm kiếm người dùng và bài viết
- Birthday celebrations and reminders | Chúc mừng sinh nhật và nhắc nhở sự kiện
- Post creation with text, images, and videos | Tạo bài viết với văn bản, hình ảnh và video
- Activity feed to track interactions | Bảng tin hoạt động để theo dõi tương tác
- Customizable user profiles | Hồ sơ người dùng
- User blocking for privacy | Chặn người dùng
- Follow/Unfollow system | Hệ thống theo dõi/hủy theo dõi người dùng
- Comment system with nested replies | Hệ thống bình luận
- Like and reaction system | Hệ thống thích và bày tỏ cảm xúc
- Video content support | Hỗ trợ video
- AI-powered chatbot assistant | Chatbot AI
- AI caption generation for images | Tạo caption tự động cho ảnh bằng AI
- AI content summarization | Tóm tắt nội dung bằng AI
- Multi-language translation with AI | Dịch đa ngôn ngữ với AI

## Tech Stack - Công Nghệ Sử Dụng

### Frontend
- **React 19** - JavaScript UI library
- **Next.js 15.2.4** - React framework for SSR and routing
- **TypeScript** - Type-safe programming language
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Next Cloudinary** - Cloudinary media integration

### Backend
- **Next.js API Routes** - API endpoints handler
- **Prisma 6.5.0** - Database ORM
- **Clerk 6.13.0** - Authentication & User Management
- **Zod** - Schema validation
- **Svix** - Webhook infrastructure

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - High-speed bundler

### Database
- **PostgreSQL** - Relational database system
- **Prisma ORM** - Type-safe database queries

## Installation - Cài Đặt

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

## Configuration - Cấu Hình 

Create a `.env` file following this template:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRECT=""
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Recommended Services:**
- Vercel for frontend/backend
- Neon PostgreSQL - Serverless SQL
<!-- - Database by Railway -->
- Cloudinary for media storage

<!-- ## 🤝 Contributing
1. Fork the repository
2. Create new branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request -->

---

[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-000000?logo=vercel)](https://vercel.com)
<!-- [![Database by Railway](https://img.shields.io/badge/Database%20by-Railway-0B0D0E?logo=railway)](https://railway.app) -->

**Contact**: hq16101971@gmail.com |
