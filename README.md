# Introvertia - Social Network - ĐỒ ÁN CƠ SỞ

![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Next.js Version](https://img.shields.io/badge/Next.js-15.2.4-000000?logo=next.js)
![Prisma Version](https://img.shields.io/badge/Prisma-6.5.0-2D3748?logo=prisma)

A social media platform made by Nguyễn Phan Hoàng Quân

Trang mạng xã hội được thực hiện bởi Nguyễn Phan Hoàng Quân

## Table of Contents - Nội Dung
- [Introvertia - Social Network - ĐỒ ÁN CƠ SỞ](#introvertia---social-network---đồ-án-cơ-sở)
  - [Table of Contents - Nội Dung](#table-of-contents---nội-dung)
  - [Key Features](#key-features)
    - [Tính Năng Chính](#tính-năng-chính)
    - [Eng](#eng)
  - [Tech Stack - Công Nghệ Sử Dụng](#tech-stack---công-nghệ-sử-dụng)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Development Tools](#development-tools)
    - [Database](#database)
  - [Installation - Cài Đặt](#installation---cài-đặt)
  - [Configuration - Cấu Hình](#configuration---cấu-hình)
  - [Deployment](#deployment)

## Key Features

### Tính Năng Chính
- Trò chuyện trực tuyến với Socket.io
- Tải lên hình ảnh với Cloudinary
- Xác thực hai yếu tố với Clerk
- Giao diện với TailwindCSS
- Thiết kế thích ứng đa thiết bị
- Thông báo theo thời gian thực
- Tính năng Stories với thời hạn 24 giờ
- Quản lý lời mời kết bạn và danh sách bạn bè
- Tìm kiếm nâng cao cho người dùng và bài viết
- Chúc mừng sinh nhật và nhắc nhở sự kiện
- Tạo bài viết với văn bản, hình ảnh và video
- Bảng tin hoạt động để theo dõi tương tác
- Hồ sơ người dùng có thể tùy chỉnh
- Chặn người dùng để bảo vệ quyền riêng tư
- Hệ thống theo dõi/hủy theo dõi người dùng
- Hệ thống bình luận với phản hồi lồng nhau
- Hệ thống thích và bày tỏ cảm xúc
- Hỗ trợ nội dung video
- Tạo caption tự động cho ảnh bằng AI
- Tóm tắt nội dung bằng AI
- Dịch đa ngôn ngữ với AI
- AI ChatBot Hỗ trợ

### Eng
- Real-time chat with Socket.io
- Cloudinary image uploads
- Two-factor authentication with Clerk
- UI with TailwindCSS
- Responsive Design
- Real-time Notifications
- Stories feature with expiration (24h expiration)
- Friend requests and friend management
- Advanced search functionality for people and posts
- Birthday celebrations and reminders
- Post creation with text, images, and videos
- Activity feed to track interactions
- Customizable user profiles
- User blocking for privacy
- Follow/Unfollow system
- Comment system with nested replies
- Like and reaction system
- Video content support
- AI caption generation for images
- AI content summarization
- Multi-language translation with AI
- AI Assistant ChatBot

## Tech Stack - Công Nghệ Sử Dụng

### Frontend
- **React 19** - JavaScript UI library
- **Next.js 15.2.4** - React framework for SSR and routing
- **TypeScript** - Type-safe programming language
- **TailwindCSS** - CSS framework
<!-- - **TailwindCSS** - Utility-first CSS framework -->
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
- Cloudinary for media storage

---

**Contact**: hq16101971@gmail.com |
