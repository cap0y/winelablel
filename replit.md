# Wine Label Design Application

## Overview

This is a full-stack wine label design application that allows users to create custom wine labels with interactive design tools and complete their purchase through Stripe payments. The app features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme (Notion-inspired)
- **State Management**: TanStack Query for server state, custom hooks for local state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Payment Processing**: Stripe integration for secure payments
- **Development**: Hot reload with Vite integration

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface with swipe gestures
- Mobile-specific breakpoints and layouts

## Key Components

### Design System
- **Wine Bottle Selector**: Choose from 6 different bottle types (classic, burgundy, champagne, bordeaux, rhone, sparkling)
- **Label Designer**: 8 predefined label designs with preview functionality
- **Icon System**: 8 decorative icons (crown, star, heart, leaf, diamond, moon, sun, feather) with color-coded themes
- **Text Editor**: Multi-field text editing with font selection and positioning
- **Design Preview**: Real-time preview with draggable text elements

### Payment System
- **Portone Integration**: Korean payment service supporting KakaoPay, cards, and bank transfers
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Pricing**: Fixed pricing model (25,000 KRW per label + 3,000 KRW shipping)

### Data Models
- **Users**: Authentication and user management
- **Wine Designs**: Complete design specifications with JSON storage for complex data
- **Orders**: Order tracking with Stripe payment integration

## Data Flow

### Design Creation Flow
1. User selects bottle type from horizontal scrollable gallery
2. User chooses label design from visual selector
3. User adds decorative icons from icon palette
4. User edits text elements (name, vintage, type) with font selection
5. User adjusts text positions through drag-and-drop interface
6. Real-time preview updates with each change

### Checkout Flow
1. User sets quantity and reviews pricing
2. Design is saved to database, generating unique design ID
3. User is redirected to Portone checkout page
4. Payment processing through Portone (KakaoPay, cards, bank transfers)
5. Order status updates based on payment result

### Data Storage
- **Design State**: Temporary state managed by custom hook during creation
- **Persistent Storage**: PostgreSQL tables for users, designs, and orders
- **Complex Data**: JSON fields for nested design properties (icons, text positions, fonts)

## External Dependencies

### Payment Processing
- **Portone**: Korean payment gateway supporting multiple payment methods
- **KakaoPay Integration**: Popular Korean mobile payment solution
- **Webhook Support**: Payment status updates and order fulfillment

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Environment Variables**: Secure configuration for API keys and database URLs

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling with custom theme
- **Lucide Icons**: Consistent icon library
- **Custom Fonts**: Typography system with multiple font options

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **Express Server**: API endpoints with development middleware
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Setup**: Local development with environment variables

### Production Build
- **Frontend**: Vite build process generates optimized static assets
- **Backend**: ESBuild bundles server code for Node.js deployment
- **Static Serving**: Express serves built frontend assets
- **Database**: Production PostgreSQL connection with SSL

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

### Deployment Considerations
- Static asset serving through Express
- Environment variable configuration for production
- Database connection management
- Stripe webhook endpoint configuration
- CORS and security headers for production