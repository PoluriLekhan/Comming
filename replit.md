# Replit.md

## Overview

This is a full-stack web application built with a modern tech stack featuring a React frontend and Express.js backend. The application appears to be designed as a newsletter subscription system with admin functionality. It uses PostgreSQL via Neon Database for data persistence, with Drizzle ORM for database operations and shadcn/ui components for the user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for JSON parsing and logging
- **Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: In-memory storage (MemStorage class) with interface for future database integration

## Key Components

### Database Layer
- **Primary Database**: PostgreSQL via Neon Database (`@neondatabase/serverless`)
- **Schema Definition**: Located in `shared/schema.ts` with Drizzle ORM
- **Migration System**: Drizzle Kit for schema migrations
- **Current Tables**: Users table with username/password fields

### Storage Interface
- **Abstraction Layer**: `IStorage` interface in `server/storage.ts`
- **Current Implementation**: In-memory storage (`MemStorage`)
- **Future-Ready**: Designed for easy migration to database-backed storage

### Frontend Components
- **UI Components**: Comprehensive set of shadcn/ui components
- **Routing**: Three main routes - Index, Admin, NotFound
- **Admin Dashboard**: Component for managing subscribers
- **Particle Background**: Canvas-based animated background
- **Form Handling**: React Hook Form integration with Zod schemas

### External Integrations
- **Supabase**: Client configured for authentication and data operations
- **Database Tables**: `subscribers` and `admin_sessions` tables defined
- **Authentication**: Session-based admin authentication system

## Data Flow

1. **Client Requests**: React frontend makes requests to Express backend via `/api` routes
2. **Server Processing**: Express middleware handles logging, JSON parsing, and error handling
3. **Storage Operations**: Requests are processed through the storage interface
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses sent back to client with appropriate status codes

## External Dependencies

### Core Dependencies
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Neon Database
- **UI Components**: Radix UI primitives, shadcn/ui
- **State Management**: TanStack Query
- **Validation**: Zod with Drizzle integration
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Database & ORM
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon Database with development connection
- **Scripts**: `npm run dev` for development mode

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Deployment**: Node.js execution of bundled backend
- **Scripts**: `npm run build` and `npm start` for production

### Database Management
- **Schema Sync**: `npm run db:push` for applying schema changes
- **Migrations**: Drizzle Kit generates migrations in `./migrations`
- **Environment**: `DATABASE_URL` environment variable required

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```