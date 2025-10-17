# Sistema de Gestión Logística

## Overview

This is a logistics management application for planning operations and resource allocation. It manages employees, vehicles, and daily assignments, including tracking employee absences and availability. The system aims for efficiency and usability for operational teams.

**Core Functionality:**
- Employee management with role-based assignments
- Vehicle fleet management, including dynamic selection and reordering
- Daily assignment planning, scheduling, and historical tracking
- Employee absence tracking
- Role customization and management
- Depot/warehouse personnel scheduling with supervisor (Encargado) designation
- Comments per vehicle in daily assignments
- Excel export of historical daily assignments

**Business Vision:** To streamline logistics operations, improve resource allocation, and provide clear oversight for operational teams.
**Market Potential:** Applicable to any business requiring dynamic management of mobile assets and personnel.
**Project Ambitions:** To be a comprehensive, user-friendly tool that significantly reduces manual planning efforts and enhances operational efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:** Page-based routing using Wouter, reusable UI components from shadcn/ui (Radix primitives), and custom domain components.
**State Management:** TanStack Query for server state and caching, with React hooks for local UI state. Integrated with backend API for optimistic updates and invalidation.
**Design System:** Material Design + Linear-inspired minimalism, utility-focused with a custom HSL-based color palette, Inter font, and Tailwind CSS for responsive, mobile-first design. Emphasizes productivity and data clarity.

### Backend Architecture

**API Structure:** RESTful Express.js server with route handlers, an abstraction layer for storage (currently in-memory with a plan for database migration).
**Data Layer:** Drizzle ORM for type-safe operations, Zod for validation, and PostgreSQL via Neon serverless. Schemas are shared between client and server for type consistency.
**API Endpoints:** Comprehensive CRUD operations for employees, vehicles, absences, daily assignments, and roles.

### Database Schema

**Tables:**
- `employees`: Employee records with multi-role support.
- `vehicles`: Vehicle fleet management.
- `employeeAbsences`: Absence tracking for employees.
- `dailyAssignments`: Historical daily assignments with a denormalized structure including vehicle snapshots, complete employee details, vehicle-specific comments, and JSON for depot assignments.
- `roles`: Available employee roles/functions.

**Key Design Decisions:**
- UUID primary keys for distributed systems compatibility.
- Array types for roles and assignmentRows, text dates (ISO format strings).
- **Denormalized structure in `dailyAssignments`**: Stores vehicle and employee details as snapshots and JSON for depot assignments to simplify Excel export, ensure historical accuracy, and improve query performance.
- Shared types between frontend and backend via Drizzle inference.

### Build & Deployment

**Development:** Vite dev server with HMR for frontend, `tsx` for backend TypeScript execution.
**Production:** Vite builds frontend to `dist/public`, esbuild bundles backend to `dist/index.js`.
**Configuration:** Path aliases for client and shared code, Tailwind with custom design tokens, PostCSS, and TypeScript strict mode.

### Feature Specifications

- **Dashboard Workflow:** Manual vehicle selection with an "Ingresar Vehículos" button, multi-select dialog for vehicles, and manual row creation for assignments.
- **History Feature:** Dedicated page (`/history`) for viewing and managing saved daily assignments, including detailed views and deletion functionality.
- **Comments and Depot Features:** Each vehicle card has a dedicated comments textarea. A separate DEPOSITO section allows scheduling warehouse personnel with multiple time slots, employee assignments, and a special toggleable ENCARGADO (Supervisor) position.
- **Excel Export:** Functionality to export historical daily assignments within a selected date range to an .xlsx file, including vehicle, driver, and assistant details.
- **Vehicle Reordering:** Dashboard vehicle cards can be reordered using up/down arrow buttons.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **@neondatabase/serverless**: For connecting to Neon PostgreSQL.

### UI Libraries
- **Radix UI**: Headless component primitives.
- **shadcn/ui**: Pre-styled component implementations based on Radix UI.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.

### Frontend Libraries
- **TanStack Query**: Server state management and caching.
- **Wouter**: Lightweight routing.
- **date-fns**: Date manipulation and formatting.
- **React Hook Form**: Form state management with Zod resolvers.
- **React Day Picker**: Calendar component.
- **xlsx**: For Excel file generation.

### Development Tools
- **Vite**: Frontend build tool and dev server.
- **esbuild**: Backend bundler.
- **tsx**: TypeScript execution for development.
- **Drizzle Kit**: Database migration tool.

### Validation & Type Safety
- **Zod**: Runtime type validation.
- **drizzle-zod**: Generates Zod schemas from Drizzle schemas.
- **TypeScript**: Static typing.