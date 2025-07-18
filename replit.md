# Crypto Token Dashboard

## Overview

This is a full-stack web application built with React and Express that displays cryptocurrency token information and trading opportunities. The application fetches data from external APIs (DexScreener and CoinGecko) to provide real-time token metrics, confidence scores, and trading recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Design**: RESTful API with JSON responses
- **Data Processing**: Custom confidence scoring algorithm for tokens
- **External APIs**: DexScreener for token data, CoinGecko for SOL price

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (configured but not actively used)
- **Session Storage**: PostgreSQL sessions with connect-pg-simple
- **Runtime Storage**: In-memory storage for development (MemStorage class)
- **Database Provider**: Neon Database (@neondatabase/serverless)

## Key Components

### Frontend Components
- **Dashboard**: Main page displaying token list and SOL price information
- **UI Components**: Comprehensive set of reusable components (cards, buttons, badges, etc.)
- **Toast System**: User notifications for data updates and errors
- **Responsive Design**: Mobile-friendly layout with proper breakpoints

### Backend Components
- **Route Handler**: `/api/dashboard` endpoint for aggregated data
- **Data Processing**: Token filtering, confidence scoring, and trade recommendations
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Request/response logging for API endpoints

### Data Models
- **Token Schema**: Pair info, price changes, volume, liquidity, confidence scores
- **SOL Price Schema**: USD and PKR price information
- **Dashboard Schema**: Combined data structure for frontend consumption

## Data Flow

1. **Frontend Request**: Dashboard component requests data from `/api/dashboard`
2. **API Processing**: Backend fetches data from DexScreener and CoinGecko APIs
3. **Data Transformation**: Raw API data is filtered, processed, and scored
4. **Confidence Scoring**: Custom algorithm calculates trading confidence (0-100)
5. **Response**: Structured data returned to frontend with tokens and SOL price
6. **UI Update**: React Query manages caching and UI updates
7. **Auto-refresh**: Data refreshes every 60 seconds automatically

## External Dependencies

### APIs
- **DexScreener API**: Token pair data, volume, liquidity information
- **CoinGecko API**: SOL price in USD for currency conversion

### Key Libraries
- **Frontend**: React, TanStack Query, Radix UI, Tailwind CSS, Wouter
- **Backend**: Express, Drizzle ORM, Zod validation
- **Development**: Vite, TypeScript, ESBuild
- **UI**: shadcn/ui component library with New York style

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Configured for PostgreSQL with Drizzle migrations

### Production
- **Frontend**: Vite build to static files served from `/dist/public`
- **Backend**: ESBuild bundle to `/dist/index.js`
- **Process**: Single Node.js process serving both API and static files
- **Environment**: Configured for Replit deployment with cartographer plugin

### Build Process
1. Frontend assets built with Vite
2. Backend TypeScript compiled with ESBuild
3. Single production bundle with static file serving
4. Database migrations applied via `drizzle-kit push`

## Notable Features

- **Real-time Updates**: Auto-refreshing dashboard with 60-second intervals
- **Confidence Scoring**: Custom algorithm for token trading recommendations
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Currency Conversion**: SOL price displayed in both USD and PKR
- **Token Filtering**: Intelligent filtering based on volume, liquidity, and price changes