# 끄레망 와인라벨 - Wine Label Design Platform

## Overview

끄레망 와인라벨 is a comprehensive wine label design platform with a Notion-style dark theme. Users can create, customize, and order wine labels through an intuitive drag-and-drop interface. The application features multilingual support (Korean, English, Japanese), gallery browsing of popular designs, and integrated payment processing through PortOne for Korean domestic payments.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Port Configuration Deployment Fixes (January 2025)
- **Port Default Fix**: Changed server default port from 3000 to 5000 to match deployment configuration expectations
- **Production Logging**: Added comprehensive production environment logging for deployment debugging
- **Enhanced Health Check**: Improved `/health` endpoint with environment variable validation, memory monitoring, and error handling
- **Deployment Documentation**: Created `DEPLOYMENT.md` with comprehensive deployment troubleshooting guide
- **Environment Validation**: Added production environment checks for required variables (DATABASE_URL)

### Previous Deployment Optimization Fixes
- **Server Configuration**: Changed server to listen on `0.0.0.0` instead of localhost for proper port forwarding in Cloud Run
- **Health Check Endpoint**: Added `/health` endpoint for deployment readiness verification
- **CORS Updates**: Enhanced CORS configuration with regex patterns to support all Replit deployment domains (`*.replit.app`, `*.repl.co`)
- **Startup Optimization**: Removed debug console.log statements to reduce application startup time
- **Dependency Management**: Installed missing `cross-env` package for proper environment variable handling

## Previous Changes (January 2025)

### PWA (Progressive Web App) Implementation
- **Service Worker**: Implemented caching strategy for offline functionality
- **Web App Manifest**: Complete PWA manifest with app icons, shortcuts, and metadata
- **App Installation**: Added install prompt for native app-like experience
- **Custom Icons**: Created 끄레망 branded PNG icons in multiple sizes (72x72 to 512x512) using Sharp
- **High-Quality Icons**: Fixed Jimp "Buffer <null>" error by generating proper PNG icons with actual image data
- **Server MIME Types**: Configured Express to serve PWA assets with correct Content-Type headers
- **Push Notifications**: Configured for future notification features
- **Update Management**: Automatic service worker updates with user notification

### Payment System Integration
- **PortOne Payment System**: Integrated Korean domestic payment system replacing Stripe
- **Korean Market Focus**: Optimized for Korean users with KRW currency support
- **Payment Methods**: Support for cards, bank transfer, KakaoPay, NaverPay
- **User Auto-Creation**: Fixed foreign key constraint issues with automatic user creation

### UI/UX Improvements
- **Tabbed Navigation**: Reorganized home page with tabs for usage guide, popular locations, and facility features
- **Multilingual Support**: Added Korean, English, and Japanese language options for storage details
- **Image Carousel**: Implemented horizontal sliding gallery with 5 images for storage locations
- **Mobile Optimization**: Enhanced mobile-first design with 끄레망's turquoise/teal color scheme

### New Features
- **Franchise Inquiry Tab**: Added comprehensive franchise inquiry system with contact forms
- **Google Maps Integration**: Prepared for Google Maps API integration with GOOGLE_API_KEY
- **Storage Tags**: Added hashtag-based tagging system for storage categories
- **Enhanced Storage Details**: Multilingual titles, descriptions, and comprehensive facility information

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Payment Processing**: Stripe integration for subscriptions and payments
- **Session Management**: Express sessions with PostgreSQL storage

### Key Components

#### Database Schema
The application uses a relational database with four main entities:
- **Users**: Customer accounts with Stripe integration
- **Storage Locations**: Physical storage facilities with geolocation
- **Storage Units**: Individual storage spaces with pricing tiers
- **Reservations**: Booking records linking users to storage units

#### API Structure
RESTful API endpoints organized by resource:
- `/api/storage-locations` - Location management
- `/api/storage-locations/:id/units` - Unit availability
- `/api/reservations` - Booking management
- Payment processing endpoints integrated with Stripe

#### UI Components
Modular component architecture:
- Layout components (Header, Navigation, Footer)
- Storage-specific components (LocationMap, StorageViewer, SizeSelector)
- Reusable UI components built on Radix primitives

## Data Flow

1. **Location Discovery**: Users browse storage locations with interactive map interface
2. **Unit Selection**: View available units with 3D visualization and pricing comparison
3. **Reservation Process**: Complete booking with user registration and payment
4. **Payment Processing**: Stripe handles subscription-based payments (monthly/quarterly/yearly)
5. **Confirmation**: Users receive booking confirmation with access details

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle with connection pooling
- **UI Framework**: Radix UI for accessible components
- **Payment**: Stripe for payment processing and subscription management
- **Development**: Vite with React plugin and TypeScript support

### Optional Integrations
- **3D Visualization**: Placeholder for Three.js integration (currently using CSS-based fallback)
- **Maps**: Basic location mapping (can be enhanced with Google Maps/Mapbox)
- **Analytics**: Ready for integration with tracking services

## Deployment Strategy

### Development Setup
- Uses Vite dev server with HMR for fast development
- Express server serves API and handles SSR for production
- Environment variables for database and Stripe configuration

### Production Build
- Vite builds optimized React bundle
- ESBuild compiles server code for Node.js deployment
- Static assets served from `/dist/public`
- Server bundle output to `/dist/index.js`

### Key Configuration
- Database connection via environment variable `DATABASE_URL`
- Stripe integration requires `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY`
- Build process combines client and server bundles for deployment

The application is designed for scalability with serverless database, stateless API design, and optimized frontend bundle. The architecture supports multi-tenancy and can be extended with additional features like mobile apps, advanced analytics, and integration with physical access control systems.