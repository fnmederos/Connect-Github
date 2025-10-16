# Sistema de Gestión Logística

## Overview

This is a logistics management application designed for planning operations and resource allocation. The system manages employees, vehicles, and daily assignments, with features for tracking employee absences and availability. Built as a full-stack web application with a focus on efficiency, clarity, and usability for operational teams.

**Core Functionality:**
- Employee management with role-based assignments
- Vehicle fleet management
- Daily assignment planning and scheduling
- Employee absence tracking
- Role customization and management

**Tech Stack:**
- Frontend: React with TypeScript, Vite
- Backend: Express.js with TypeScript
- Database: PostgreSQL via Neon serverless
- ORM: Drizzle
- UI Components: Radix UI + shadcn/ui
- Styling: Tailwind CSS with custom design system
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Page-based routing using Wouter (lightweight React router)
- Reusable UI components from shadcn/ui (Radix primitives)
- Custom domain components: `EmployeeCard`, `VehicleCard`, `AssignmentCard`, `AvailabilityDialog`
- Centralized theme management with light/dark mode support

**State Management:**
- TanStack Query for server state and caching
- Local state with React hooks for UI interactions
- Query invalidation for optimistic updates
- Currently using mock data with TODO markers for backend integration

**Design System:**
- Material Design + Linear-inspired minimalism
- Utility-focused approach prioritizing clarity and efficiency
- Custom color palette with HSL values for light/dark themes
- Typography: Inter font family via Google Fonts CDN
- Spacing: Tailwind primitives (2, 4, 6, 8, 12, 16)
- Responsive design with mobile-first approach

**Rationale:** The frontend emphasizes productivity and data clarity. The component library (shadcn/ui) was chosen for its flexibility and accessibility. The design system prioritizes functional elements over decorative ones, suitable for an operational/management tool.

### Backend Architecture

**API Structure:**
- RESTful Express.js server
- Route handlers in `server/routes.ts`
- Storage abstraction layer (`IStorage` interface)
- Currently using in-memory storage (`MemStorage`) with interface for database migration

**Data Layer:**
- Drizzle ORM for type-safe database operations
- Schema definition in `shared/schema.ts` (shared between client/server)
- Zod validation schemas derived from Drizzle schemas
- PostgreSQL database via Neon serverless (@neondatabase/serverless)

**Development Setup:**
- Vite dev server with HMR in development
- Express middleware for logging and error handling
- Static file serving in production
- TypeScript throughout with strict mode enabled

**API Endpoints:**
```
GET    /api/absences              - Get all absences or by employeeId
POST   /api/absences              - Create new absence
DELETE /api/absences/:id          - Delete absence
```

**Rationale:** The storage abstraction allows easy transition from in-memory to database storage. The shared schema approach ensures type safety across the full stack. Express was chosen for its simplicity and extensive middleware ecosystem.

### Database Schema

**Tables:**
- `employees`: id, name, roles[] - Employee records with multi-role support
- `vehicles`: id, name, licensePlate - Vehicle fleet management
- `assignments`: id, date, vehicleId, employeeIds[], details - Daily assignments
- `employeeAbsences`: id, employeeId, startDate, endDate, reason - Absence tracking

**Key Design Decisions:**
- UUID primary keys for distributed systems compatibility
- Array types for roles and employeeIds (PostgreSQL native support)
- Text dates for flexibility (ISO format strings)
- Shared types between frontend and backend via Drizzle inference

**Rationale:** The schema is normalized while maintaining simplicity. Array fields avoid junction tables for many-to-many relationships where appropriate. The shared type system eliminates duplication and ensures consistency.

### Build & Deployment

**Development:**
- `npm run dev`: Runs Express server with Vite middleware
- Hot module replacement for frontend
- TypeScript compilation via `tsx` for backend

**Production:**
- `npm run build`: Vite builds frontend, esbuild bundles backend
- Frontend output: `dist/public`
- Backend output: `dist/index.js` (ESM format)
- `npm start`: Runs production server

**Configuration:**
- Path aliases: `@/` for client, `@shared/` for shared code
- Tailwind configured with custom design tokens
- PostCSS with autoprefixer
- TypeScript strict mode with ESNext modules

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe ORM with schema migrations
- **Connection**: Via `@neondatabase/serverless` package
- **Environment**: Requires `DATABASE_URL` environment variable

### UI Libraries
- **Radix UI**: Headless component primitives (dialogs, popovers, selects, etc.)
- **shadcn/ui**: Pre-styled component implementations on Radix
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing (< 2KB alternative to React Router)
- **date-fns**: Date manipulation and formatting (with Spanish locale)
- **React Hook Form**: Form state management (with Zod resolvers)
- **React Day Picker**: Calendar component for date selection

### Development Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundler for production
- **tsx**: TypeScript execution for development
- **Drizzle Kit**: Database migration tool

### Validation & Type Safety
- **Zod**: Runtime type validation
- **drizzle-zod**: Generate Zod schemas from Drizzle schemas
- **TypeScript**: Static typing throughout

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express (configured but not actively used in current implementation)

**Note on Current State:**
The application currently uses in-memory storage with mock data. The database infrastructure (Drizzle, Neon) is configured but not yet connected. TODO comments throughout the codebase indicate where backend integration is needed.