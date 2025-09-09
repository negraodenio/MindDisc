# MindDisc Pro - Corporate Mental Health Platform

## Overview

MindDisc Pro is a comprehensive corporate mental health management platform that combines DISC personality assessments with mental health monitoring and compliance management. The system provides a complete solution for companies to track employee wellbeing, manage psychosocial risks, and maintain compliance with Brazilian regulations including LGPD, RAPS, INSS, and inclusion laws.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript using modern web development practices:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based authentication with JWT tokens stored in localStorage

### Backend Architecture

The backend follows a REST API architecture built on Node.js:

- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js for HTTP server and API routing
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful endpoints with structured error handling
- **Middleware**: Custom logging, authentication middleware, and CORS handling
- **Development**: Hot reload with tsx and Vite integration

### Data Storage Solutions

The application uses PostgreSQL as the primary database:

- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection Pooling**: Neon serverless connection pooling for scalability
- **Data Validation**: Zod schemas for runtime type checking and validation

### Key Data Models

The system manages several core entities:
- **Companies**: Multi-tenant organization management
- **Users**: Employee profiles with DISC and mental health data
- **Assessments**: DISC personality and mental health evaluations
- **Compliance Modules**: RAPS, INSS, LGPD, and inclusion tracking
- **Risk Management**: Psychosocial risk assessment and mitigation
- **Reporting**: Analytics and compliance reporting

### Authentication and Authorization

- **JWT-based Authentication**: Stateless token authentication
- **Role-based Access Control**: Admin and employee role differentiation
- **Session Management**: Token-based sessions with automatic expiration
- **Password Security**: Bcrypt hashing with salt rounds
- **LGPD Compliance**: Explicit consent tracking for data processing

## External Dependencies

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database hosting
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database schema management and migrations

### Authentication and Security
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and verification
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used)

### Frontend UI and Interaction
- **@radix-ui/***: Comprehensive UI primitive components library
- **@tanstack/react-query**: Server state management and data fetching
- **@hookform/resolvers**: Form validation resolver for React Hook Form
- **react-hook-form**: Performant form library with validation
- **wouter**: Lightweight React router

### Styling and Design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **clsx**: Conditional className utility
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Date and Utility Libraries
- **date-fns**: Modern date utility library
- **zod**: TypeScript-first schema validation
- **nanoid**: URL-safe unique ID generator

### Brazilian Compliance Integrations
The system is designed to integrate with:
- **RAPS (Rede de Atenção Psicossocial)**: Mental health service network
- **INSS**: Social security and benefits management
- **LGPD**: Data protection and privacy compliance
- **LBI (Lei Brasileira de Inclusão)**: Accessibility and inclusion requirements