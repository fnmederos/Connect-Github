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
- Fully integrated with backend API endpoints

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
GET    /api/employees             - Get all employees
POST   /api/employees             - Create new employee
PATCH  /api/employees/:id         - Update employee
DELETE /api/employees/:id         - Delete employee

GET    /api/vehicles              - Get all vehicles
POST   /api/vehicles              - Create new vehicle
PATCH  /api/vehicles/:id          - Update vehicle
DELETE /api/vehicles/:id          - Delete vehicle

GET    /api/absences              - Get all absences or by employeeId
POST   /api/absences              - Create new absence
DELETE /api/absences/:id          - Delete absence

GET    /api/daily-assignments     - Get all daily assignments
POST   /api/daily-assignments     - Create new daily assignment

GET    /api/roles                 - Get available roles
POST   /api/roles                 - Create new role
DELETE /api/roles/:name           - Delete role
```

**Rationale:** The storage abstraction allows easy transition from in-memory to database storage. The shared schema approach ensures type safety across the full stack. Express was chosen for its simplicity and extensive middleware ecosystem.

### Database Schema

**Tables:**
- `employees`: id, name, roles[] - Employee records with multi-role support
- `vehicles`: id, name, licensePlate - Vehicle fleet management
- `employeeAbsences`: id, employeeId, startDate, endDate, reason - Absence tracking
- `dailyAssignments`: id, date, vehicleId, vehicleName, vehicleLicensePlate, assignmentRows[] - Historical daily assignments with denormalized structure for Excel export
- `roles`: name (primary key) - Available employee roles/functions

**Key Design Decisions:**
- UUID primary keys for distributed systems compatibility
- Array types for roles and assignmentRows (PostgreSQL native support)
- Text dates for flexibility (ISO format strings)
- Shared types between frontend and backend via Drizzle inference
- **Denormalized structure in dailyAssignments**: Vehicle snapshots (name, plate) and complete employee details stored directly for simplified Excel export and historical accuracy

**Rationale:** The schema balances normalization with practical needs. The `dailyAssignments` table uses a denormalized approach - storing vehicle and employee details as snapshots rather than foreign keys. This design choice prioritizes:
1. **Excel Export Simplicity**: All data needed for reporting is in one table
2. **Historical Accuracy**: Changes to vehicles/employees don't affect past assignments
3. **Query Performance**: No joins needed to display complete assignment history

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

## Recent Changes (October 2025)

### Dashboard Workflow Update (Latest)
- **Manual Vehicle Selection**: Dashboard no longer shows all vehicles automatically
- **"Ingresar Vehículos" Button**: New workflow - user selects which vehicles will operate each day
- **Vehicle Selection Dialog**: Multi-select interface with checkboxes, "Select All", and "Deselect All" options
- **Manual Row Creation**: Assignment rows are no longer auto-initialized - user adds them as needed
- **Dynamic Selection**: Users can change vehicle selection at any time, clearing or adding vehicles
- **State Management**: Assignments for deselected vehicles are properly cleaned up

### History Feature Implementation
- **New Page**: Added History page (`/history`) for viewing saved daily assignments
- **Data Structure**: Implemented denormalized `dailyAssignments` table optimized for future Excel export
- **Dashboard Integration**: "Guardar Planificación" button now saves complete daily assignments to backend
- **Day Details View**: Click on any history card to see full breakdown of vehicle assignments, personnel, and schedules
- **API Migration**: All pages (Employees, Vehicles, Dashboard) now use real API endpoints instead of mock data

### Technical Implementation
- Created `POST /api/daily-assignments` endpoint to save daily plans
- Created `GET /api/daily-assignments` endpoint to retrieve historical data
- Implemented VehicleSelectionDialog component with proper state management
- Dashboard state correctly rebuilds when vehicle selection changes
- End-to-end tested: vehicle selection → manual assignment creation → save → history view → deselection flow

### Comments and DEPOSITO Features (Latest - Refactored Oct 2025)
- **Comments Field**: Each vehicle has its own comments textarea
  - **Location**: Inside each vehicle card, below the "+ Agregar línea" button
  - **Scope**: Comments are per-vehicle, not global
  - **Placeholder**: "Comentarios para este vehículo..."
  - Saved independently with each vehicle's daily assignment
  - Displayed in History page per vehicle
  - Supports multi-line text with whitespace preservation
  - **Backward Compatibility**: Legacy templates with global comments are automatically distributed to all vehicles when loaded

- **DEPOSITO Section**: Separate section for warehouse personnel scheduling (not part of vehicle cards)
  - Always visible below vehicles in Dashboard (pushes down as vehicles are added)
  - Add/remove multiple time slots with custom times (e.g., "08:00-12:00", "14:00-18:00")
  - Each time slot can have multiple employees assigned
  - Employees shown by name only (no role/position field needed)
  - Special ENCARGADO (Supervisor) position:
    - Toggle button to mark employee as ENCARGADO
    - Only 1 ENCARGADO allowed per time slot (auto-toggles off others when activating)
    - Can have multiple ENCARGADO across different time slots
    - Not required in every time slot
    - Visually highlighted with primary color background and border
    - Shows "ENCARGADO:" prefix label for clarity
  - Data persists as JSON in database for Excel export compatibility
  - Full integration with Templates system (save/load DEPOSITO configurations)

- **Database Schema Updates**:
  - Added `comments` (text) field to `daily_assignments` and `templates` tables
  - Added `deposito_assignments` (text, JSON) field to both tables
  - Fields use `notNull()` with defaults for data consistency
  - Drizzle automatically maps snake_case DB columns to camelCase TypeScript properties

- **History Page Enhancements**:
  - Displays per-vehicle comments in day detail view
  - Shows DEPOSITO data separately (searches all assignments for the date)
  - ENCARGADO employees highlighted with same styling as Dashboard
  - Time slots and employee assignments clearly organized

- **Technical Notes**:
  - **State Management**: Dashboard uses `vehicleComments: Record<string, string>` (key = vehicleId, value = comments)
  - **Persistence**: Each vehicle's `comments` field in `daily_assignments` table stores its own comments
  - **Templates**: Comments saved as JSON object `{"vehicleId1": "comment1", "vehicleId2": "comment2"}`
  - **Backward Compatibility**: Old templates with string comments are auto-converted by distributing to all vehicles
  - DEPOSITO assignments saved with each vehicle as denormalized JSON for Excel export compatibility
  - Future optimization possible: extract DEPOSITO to separate day-level entity
  - End-to-end tested: per-vehicle comments → save → History display → template save/load with legacy support